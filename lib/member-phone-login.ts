import "server-only";

import type { User } from "@prisma/client";
import { memberPlaceholderEmail } from "@/lib/member-display-email";
import { prisma } from "@/lib/prisma";

export function normalizeLoginPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function loginPhonesMatch(inputPhone: string, storedPhone: string): boolean {
  const a = normalizeLoginPhoneDigits(inputPhone);
  const b = normalizeLoginPhoneDigits(storedPhone);
  return a.length >= 6 && b.length >= 6 && a === b;
}

export type MemberPhoneLoginFailure =
  | "NOT_FOUND"
  | "NO_QR"
  | "NO_QR_KEY"
  | "INVALID_KEY";

export type MemberPhoneLoginSuccess = {
  user: User;
  memberId: string;
};

const memberLoginSelect = {
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  phone: true,
  enrollmentStatus: true,
  user: true,
  assignedQrCodes: {
    where: { status: { not: "ARCHIVED" as const } },
    orderBy: { updatedAt: "desc" as const },
    take: 1,
    select: { qrKey: true, publicId: true },
  },
};

async function ensureMemberUser(member: {
  id: string;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  user: User | null;
}): Promise<User> {
  if (member.user) return member.user;

  const displayName = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Adhérent";
  const email = memberPlaceholderEmail(member.id);

  const user = await prisma.user.create({
    data: {
      email,
      name: displayName,
      role: "MEMBRE",
    },
  });

  await prisma.member.update({
    where: { id: member.id },
    data: { userId: user.id },
  });

  return user;
}

/** Authentifie un adhérent via téléphone + clé QR assignée. */
export async function authenticateMemberByPhoneAndQrKey(
  phone: string,
  key: string,
): Promise<{ ok: true; value: MemberPhoneLoginSuccess } | { ok: false; reason: MemberPhoneLoginFailure }> {
  const trimmedPhone = phone.trim();
  const trimmedKey = key.trim();

  if (!trimmedPhone || trimmedKey.length < 1) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const candidates = await prisma.member.findMany({
    where: { phone: { not: null } },
    select: memberLoginSelect,
  });

  const member = candidates.find((row) => row.phone && loginPhonesMatch(trimmedPhone, row.phone));
  if (!member) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const qr = member.assignedQrCodes[0];
  if (!qr) {
    return { ok: false, reason: "NO_QR" };
  }

  if (!qr.qrKey.trim()) {
    return { ok: false, reason: "NO_QR_KEY" };
  }

  if (trimmedKey !== qr.qrKey) {
    return { ok: false, reason: "INVALID_KEY" };
  }

  const user = await ensureMemberUser(member);

  return {
    ok: true,
    value: { user, memberId: member.id },
  };
}

/** Réutilisé par le scan QR : adhérent assigné + clé valide. */
export async function authenticateMemberByQrPublicIdAndKey(
  publicId: string,
  key: string,
): Promise<{ ok: true; value: MemberPhoneLoginSuccess } | { ok: false; reason: MemberPhoneLoginFailure }> {
  const trimmedKey = key.trim();
  if (!trimmedKey) {
    return { ok: false, reason: "INVALID_KEY" };
  }

  const qr = await prisma.qrCode.findUnique({
    where: { publicId: publicId.trim() },
    select: {
      qrKey: true,
      assignedMemberId: true,
      assignedMember: { select: memberLoginSelect },
    },
  });

  if (!qr?.assignedMemberId || !qr.assignedMember) {
    return { ok: false, reason: "NO_QR" };
  }

  const member = qr.assignedMember;

  if (!qr.qrKey.trim()) {
    return { ok: false, reason: "NO_QR_KEY" };
  }

  if (trimmedKey !== qr.qrKey) {
    return { ok: false, reason: "INVALID_KEY" };
  }

  const user = await ensureMemberUser(member);
  return { ok: true, value: { user, memberId: member.id } };
}

export function memberPhoneLoginErrorMessage(reason: MemberPhoneLoginFailure): string {
  switch (reason) {
    case "NO_QR":
      return "Aucun QR code assigné à ce compte. Contactez le studio pour finaliser votre inscription.";
    case "NO_QR_KEY":
      return "Votre QR code n'a pas encore de clé. Contactez le studio.";
    case "INVALID_KEY":
    case "NOT_FOUND":
    default:
      return "Le numéro de téléphone ou la clé QR est incorrect.";
  }
}
