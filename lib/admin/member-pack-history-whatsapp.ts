import "server-only";

import { listMemberOwnedPacks, type MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import {
  formatYmdPrismaDate,
  parseYmdLocal,
} from "@/lib/calendar-day";
import { courseLabel } from "@/lib/course-labels";
import { getEnrollmentPeriodBounds } from "@/lib/member-pack-enrollment-period";
import { PACK_SESSION_CONSUMED_WHERE } from "@/lib/pack-session-consumption";
import { buildWaMeUrl, toWhatsAppPhoneDigits } from "@/lib/admin/whatsapp-phone";
import {
  formatWhatsAppClock,
  formatWhatsAppDateLong,
  formatWhatsAppWeekdayLong,
  resolvePackWhatsAppStatus,
} from "@/lib/admin/whatsapp-pack-format";
import { prisma } from "@/lib/prisma";

export type PackHistoryWhatsAppSessionLine = {
  sessionDateYmd: string;
  startTime: string;
  endTime: string;
  courseLabel: string;
};

export type PackHistoryWhatsAppPayload = {
  memberId: string;
  enrollmentId: string;
  memberName: string;
  phone: string;
  phoneDigits: string;
  waUrl: string;
  message: string;
  packName: string;
  statusLabel: string;
};

async function loadConsumedSessionsForEnrollment(input: {
  memberId: string;
  pack: MemberOwnedPackDto;
  allPacks: MemberOwnedPackDto[];
}): Promise<PackHistoryWhatsAppSessionLine[]> {
  const enrollmentsAsc = [...input.allPacks].sort(
    (a, b) =>
      new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime() ||
      a.enrollmentId.localeCompare(b.enrollmentId),
  );

  const periodRows = enrollmentsAsc.map((p) => ({
    id: p.enrollmentId,
    packId: p.packId,
    purchasedAt: new Date(p.purchasedAt),
    closedAt: null as Date | null,
    packStartedAt: p.packStartedAt ? new Date(p.packStartedAt) : null,
    status: p.enrollmentStatus,
  }));

  const target = periodRows.find((r) => r.id === input.pack.enrollmentId);
  if (!target) return [];

  const bounds = getEnrollmentPeriodBounds(target, periodRows);
  const take = Math.max(input.pack.consumedSessions, 0);
  if (take === 0) return [];

  const rows = await prisma.reservation.findMany({
    where: {
      memberId: input.memberId,
      AND: [
        PACK_SESSION_CONSUMED_WHERE,
        {
          OR: [
            { debitedPackId: input.pack.packId },
            { debitedPackId: null, status: "ATTENDED" },
          ],
        },
      ],
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    select: {
      sessionDate: true,
      debitedPackId: true,
      planning: { select: { courseSlug: true, startTime: true, endTime: true } },
    },
  });

  const lines: PackHistoryWhatsAppSessionLine[] = [];
  for (const row of rows) {
    if (lines.length >= take) break;
    if (row.debitedPackId && row.debitedPackId !== input.pack.packId) continue;

    const day = parseYmdLocal(formatYmdPrismaDate(row.sessionDate));
    if (!day) continue;
    const dayMs = day.getTime();
    if (bounds.periodStart && dayMs < bounds.periodStart.getTime()) continue;
    if (bounds.periodEndExclusive && dayMs >= bounds.periodEndExclusive.getTime()) continue;

    lines.push({
      sessionDateYmd: formatYmdPrismaDate(row.sessionDate),
      startTime: row.planning.startTime,
      endTime: row.planning.endTime,
      courseLabel: courseLabel(row.planning.courseSlug),
    });
  }

  return lines;
}

/**
 * Historique WhatsApp d'un pack sélectionné (onglet Packs fiche adhérente).
 * Indépendant du message de confirmation de présence.
 */
export function buildPackHistoryWhatsAppMessage(input: {
  memberName: string;
  packName: string;
  purchasedAt: string | null;
  firstReservationAt: string | null;
  expiresAt: string | null;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
  sessions: PackHistoryWhatsAppSessionLine[];
}): string {
  const total = input.totalSessions == null ? "—" : String(input.totalSessions);

  const lines: string[] = [
    `Bonjour Mme ${input.memberName},`,
    "",
    "Voici l'historique de votre pack :",
    "",
    `Pack : ${input.packName}`,
    "",
    `* Date d'achat : ${formatWhatsAppDateLong(input.purchasedAt)}`,
    `* Première réservation : ${
      input.firstReservationAt
        ? formatWhatsAppDateLong(input.firstReservationAt)
        : "Pas encore démarré"
    }`,
    `* Validité du pack : ${formatWhatsAppDateLong(input.expiresAt)}`,
    "",
    "Suivi du pack",
    "",
    `* Nombre total de séances : ${total}`,
    `* Séances consommées : ${input.consumedSessions}`,
    `* Séances restantes : ${input.remainingSessions}`,
  ];

  if (input.sessions.length > 0) {
    lines.push("", "Historique des séances", "");
    input.sessions.forEach((session, index) => {
      const day = formatWhatsAppWeekdayLong(session.sessionDateYmd);
      const start = formatWhatsAppClock(session.startTime);
      const end = formatWhatsAppClock(session.endTime);
      lines.push(`${index + 1}. ${day} — ${start}–${end}`);
      lines.push(`    ${session.courseLabel}`);
      if (index < input.sessions.length - 1) lines.push("");
    });
  } else {
    lines.push("", "Historique des séances", "", "Aucune séance consommée.");
  }

  lines.push("", "Au plaisir de vous retrouver prochainement chez Aura Studio Pilates.");
  return lines.join("\n");
}

export async function getPackHistoryWhatsAppPayload(input: {
  memberId: string;
  enrollmentId: string;
}): Promise<
  | { ok: true; value: PackHistoryWhatsAppPayload }
  | { ok: false; code: "MEMBER_NOT_FOUND" | "PACK_NOT_FOUND" | "NO_PHONE" }
> {
  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
    select: { id: true, firstName: true, lastName: true, phone: true },
  });
  if (!member) return { ok: false, code: "MEMBER_NOT_FOUND" };

  const phone = member.phone?.trim() ?? "";
  const phoneDigits = toWhatsAppPhoneDigits(phone);
  if (!phoneDigits) return { ok: false, code: "NO_PHONE" };

  const packs = await listMemberOwnedPacks(input.memberId);
  const pack = packs.find((p) => p.enrollmentId === input.enrollmentId);
  if (!pack) return { ok: false, code: "PACK_NOT_FOUND" };

  const sessions = await loadConsumedSessionsForEnrollment({
    memberId: input.memberId,
    pack,
    allPacks: packs,
  });

  const statusLabel = resolvePackWhatsAppStatus(pack);
  const memberName =
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Adhérente";

  const message = buildPackHistoryWhatsAppMessage({
    memberName,
    packName: pack.packName,
    purchasedAt: pack.purchasedAt,
    firstReservationAt: pack.packStartedAt,
    expiresAt: pack.packExpiresAt,
    totalSessions: pack.totalSessions,
    consumedSessions: pack.consumedSessions,
    remainingSessions: pack.remainingSessions,
    sessions,
  });

  return {
    ok: true,
    value: {
      memberId: member.id,
      enrollmentId: pack.enrollmentId,
      memberName,
      phone,
      phoneDigits,
      waUrl: buildWaMeUrl(phoneDigits, message),
      message,
      packName: pack.packName,
      statusLabel,
    },
  };
}

export function packHistoryWhatsAppErrorMessage(
  code: "MEMBER_NOT_FOUND" | "PACK_NOT_FOUND" | "NO_PHONE",
): string {
  if (code === "MEMBER_NOT_FOUND") return "Adhérente introuvable";
  if (code === "PACK_NOT_FOUND") return "Pack introuvable";
  return "Aucun numéro de téléphone enregistré pour ce membre";
}
