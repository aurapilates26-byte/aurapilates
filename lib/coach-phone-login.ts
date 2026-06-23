import "server-only";

import type { User } from "@prisma/client";
import { coachPlaceholderEmail } from "@/lib/coach-display-email";
import { loginPhonesMatch, normalizeLoginPhoneDigits } from "@/lib/member-phone-login";
import { prisma } from "@/lib/prisma";

export type CoachPhoneLoginFailure =
  | "NOT_FOUND"
  | "INACTIVE"
  | "NO_QR"
  | "NO_QR_KEY"
  | "INVALID_KEY";

export type CoachPhoneLoginSuccess = {
  user: User;
  coachId: string;
};

const coachLoginSelect = {
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  phone: true,
  isActive: true,
  user: true,
  assignedQrCodes: {
    where: { status: { not: "ARCHIVED" as const } },
    orderBy: { updatedAt: "desc" as const },
    take: 1,
    select: { qrKey: true, publicId: true },
  },
};

async function ensureCoachUser(coach: {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  user: User | null;
}): Promise<User> {
  if (coach.user) return coach.user;

  const displayName = `${coach.firstName} ${coach.lastName}`.trim() || "Coach";
  const email = coachPlaceholderEmail(coach.id);

  const user = await prisma.user.create({
    data: {
      email,
      name: displayName,
      role: "COACH",
    },
  });

  await prisma.coach.update({
    where: { id: coach.id },
    data: { userId: user.id },
  });

  return user;
}

function coachLoginFailureFromQr(
  coach: { isActive: boolean; assignedQrCodes: { qrKey: string }[] },
  trimmedKey: string,
): CoachPhoneLoginFailure | null {
  if (!coach.isActive) return "INACTIVE";
  const qr = coach.assignedQrCodes[0];
  if (!qr) return "NO_QR";
  if (!qr.qrKey.trim()) return "NO_QR_KEY";
  if (trimmedKey !== qr.qrKey) return "INVALID_KEY";
  return null;
}

/** Authentifie un coach via téléphone + clé QR assignée. */
export async function authenticateCoachByPhoneAndQrKey(
  phone: string,
  key: string,
): Promise<{ ok: true; value: CoachPhoneLoginSuccess } | { ok: false; reason: CoachPhoneLoginFailure }> {
  const trimmedPhone = phone.trim();
  const trimmedKey = key.trim();

  if (!trimmedPhone || trimmedKey.length < 1) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const candidates = await prisma.coach.findMany({
    where: { phone: { not: null } },
    select: coachLoginSelect,
  });

  const coach = candidates.find((row) => row.phone && loginPhonesMatch(trimmedPhone, row.phone));
  if (!coach) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const qrFailure = coachLoginFailureFromQr(coach, trimmedKey);
  if (qrFailure) {
    return { ok: false, reason: qrFailure };
  }

  const user = await ensureCoachUser(coach);
  return { ok: true, value: { user, coachId: coach.id } };
}

/** Scan QR : coach assigné + clé valide. */
export async function authenticateCoachByQrPublicIdAndKey(
  publicId: string,
  key: string,
): Promise<{ ok: true; value: CoachPhoneLoginSuccess } | { ok: false; reason: CoachPhoneLoginFailure }> {
  const trimmedKey = key.trim();
  if (!trimmedKey) {
    return { ok: false, reason: "INVALID_KEY" };
  }

  const qr = await prisma.qrCode.findUnique({
    where: { publicId: publicId.trim() },
    select: {
      qrKey: true,
      assignedCoachId: true,
      assignedCoach: { select: coachLoginSelect },
    },
  });

  if (!qr?.assignedCoachId || !qr.assignedCoach) {
    return { ok: false, reason: "NO_QR" };
  }

  const coach = qr.assignedCoach;
  if (!qr.qrKey.trim()) {
    return { ok: false, reason: "NO_QR_KEY" };
  }
  if (trimmedKey !== qr.qrKey) {
    return { ok: false, reason: "INVALID_KEY" };
  }
  if (!coach.isActive) {
    return { ok: false, reason: "INACTIVE" };
  }

  const user = await ensureCoachUser(coach);
  return { ok: true, value: { user, coachId: coach.id } };
}

export function coachPhoneLoginErrorMessage(reason: CoachPhoneLoginFailure): string {
  switch (reason) {
    case "INACTIVE":
      return "Ce compte coach est inactif. Contactez le studio.";
    case "NO_QR":
      return "Aucun QR code assigné à ce coach. Contactez le studio.";
    case "NO_QR_KEY":
      return "Le QR code coach n'a pas encore de clé. Contactez le studio.";
    case "INVALID_KEY":
    case "NOT_FOUND":
    default:
      return "Le numéro de téléphone ou la clé QR est incorrect.";
  }
}

export { normalizeLoginPhoneDigits };
