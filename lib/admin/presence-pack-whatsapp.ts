import "server-only";

import { listMemberOwnedPacks, type MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { formatYmdPrismaDate } from "@/lib/calendar-day";
import { courseLabel } from "@/lib/course-labels";
import { buildWaMeUrl, toWhatsAppPhoneDigits } from "@/lib/admin/whatsapp-phone";
import {
  formatWhatsAppClock,
  formatWhatsAppDateLong,
  formatWhatsAppWeekdayLong,
} from "@/lib/admin/whatsapp-pack-format";
import { prisma } from "@/lib/prisma";

export type PresenceWhatsAppPayload = {
  reservationId: string;
  memberId: string;
  memberName: string;
  phone: string;
  phoneDigits: string;
  waUrl: string;
  message: string;
};

function pickPresencePack(
  packs: MemberOwnedPackDto[],
  debitedPackId: string | null,
  memberPackId: string | null,
): MemberOwnedPackDto | null {
  if (packs.length === 0) return null;

  const preferredPackId = debitedPackId ?? memberPackId;
  if (preferredPackId) {
    const forPack = packs.filter((p) => p.packId === preferredPackId);
    if (forPack.length > 0) {
      const primary = forPack.find((p) => p.isPrimary);
      if (primary) return primary;
      const open = forPack.find((p) => p.status === "active" || p.status === "pending");
      if (open) return open;
      return forPack[0] ?? null;
    }
  }

  return packs.find((p) => p.isPrimary) ?? packs[0] ?? null;
}

/**
 * Message WhatsApp après marquage de présence :
 * confirmation courte (sans historique complet du pack).
 */
export function buildPresenceConfirmationWhatsAppMessage(input: {
  memberName: string;
  packName: string;
  expiresAt: string | null;
  lastPresenceYmd: string;
  lastPresenceStartTime: string;
  lastPresenceEndTime: string;
  lastPresenceCourseLabel: string;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
}): string {
  const total = input.totalSessions == null ? "—" : String(input.totalSessions);
  const dayLine = formatWhatsAppWeekdayLong(input.lastPresenceYmd);
  const start = formatWhatsAppClock(input.lastPresenceStartTime);
  const end = formatWhatsAppClock(input.lastPresenceEndTime);

  return [
    `Bonjour Mme ${input.memberName},`,
    "",
    "Votre présence a bien été enregistrée :",
    "",
    dayLine,
    `${start} – ${end}`,
    input.lastPresenceCourseLabel,
    "",
    `Pack : ${input.packName}`,
    "",
    `* Séances consommées : ${input.consumedSessions} / ${total}`,
    `* Séances restantes : ${input.remainingSessions}`,
    `* Validité du pack : ${formatWhatsAppDateLong(input.expiresAt)}`,
    "",
    "Au plaisir de vous retrouver prochainement chez Aura Studio Pilates.",
  ].join("\n");
}

/**
 * Snapshot lecture seule après présence — aucun effet pack / présence.
 * Pas d'historique complet des séances (réservé à l'icône Pack fiche adhérente).
 */
export async function getPresencePackWhatsAppPayload(
  reservationId: string,
): Promise<
  | { ok: true; value: PresenceWhatsAppPayload }
  | { ok: false; code: "NOT_FOUND" | "NOT_ATTENDED" | "NO_PHONE" | "NO_PACK" }
> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      status: true,
      memberId: true,
      debitedPackId: true,
      sessionDate: true,
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          packId: true,
        },
      },
      planning: {
        select: {
          startTime: true,
          endTime: true,
          courseSlug: true,
        },
      },
    },
  });

  if (!reservation) return { ok: false, code: "NOT_FOUND" };
  if (reservation.status !== "ATTENDED") return { ok: false, code: "NOT_ATTENDED" };

  const phone = reservation.member.phone?.trim() ?? "";
  const phoneDigits = toWhatsAppPhoneDigits(phone);
  if (!phoneDigits) return { ok: false, code: "NO_PHONE" };

  const packs = await listMemberOwnedPacks(reservation.memberId);
  const pack = pickPresencePack(
    packs,
    reservation.debitedPackId,
    reservation.member.packId,
  );
  if (!pack) return { ok: false, code: "NO_PACK" };

  const memberName =
    `${reservation.member.firstName ?? ""} ${reservation.member.lastName ?? ""}`.trim() ||
    "Adhérente";

  const message = buildPresenceConfirmationWhatsAppMessage({
    memberName,
    packName: pack.packName,
    expiresAt: pack.packExpiresAt,
    lastPresenceYmd: formatYmdPrismaDate(reservation.sessionDate),
    lastPresenceStartTime: reservation.planning.startTime,
    lastPresenceEndTime: reservation.planning.endTime,
    lastPresenceCourseLabel: courseLabel(reservation.planning.courseSlug),
    totalSessions: pack.totalSessions,
    consumedSessions: pack.consumedSessions,
    remainingSessions: pack.remainingSessions,
  });

  return {
    ok: true,
    value: {
      reservationId: reservation.id,
      memberId: reservation.memberId,
      memberName,
      phone,
      phoneDigits,
      waUrl: buildWaMeUrl(phoneDigits, message),
      message,
    },
  };
}

export function presencePackWhatsAppErrorMessage(
  code: "NOT_FOUND" | "NOT_ATTENDED" | "NO_PHONE" | "NO_PACK",
): string {
  if (code === "NOT_FOUND") return "Réservation introuvable";
  if (code === "NOT_ATTENDED") return "Présence non enregistrée pour cette réservation";
  if (code === "NO_PHONE") return "Aucun numéro de téléphone enregistré pour ce membre";
  return "Aucun pack associé à ce membre";
}
