import "server-only";

import { createHash, randomBytes, randomInt } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import QRCode from "qrcode";
import { QrCodeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function buildPublicId() {
  const seed = `${Date.now()}-${randomBytes(16).toString("hex")}`;
  return createHash("sha256").update(seed).digest("hex").slice(0, 24);
}

async function buildUniqueQrKey() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = String(randomInt(0, 10_000)).padStart(4, "0");
    const existing = await prisma.qrCode.findFirst({
      where: { qrKey: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("QR_KEY_POOL_EXHAUSTED");
}

function resolveScanOrigin(request?: Request): string {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (envOrigin) return envOrigin.replace(/\/$/, "");

  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      // ignore
    }
  }

  return "https://aurapilates.tn";
}

function buildPublicScanUrl(publicId: string, request?: Request) {
  return `${resolveScanOrigin(request)}/id/${publicId}`;
}

async function writeQrCodeFile(params: { publicId: string; targetUrl: string }) {
  const outputDir = join(process.cwd(), "public", "qrcode");
  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, `${params.publicId}.png`);
  const pngBuffer = await QRCode.toBuffer(params.targetUrl, {
    width: 512,
    color: { dark: "#000000", light: "#FFFFFF" },
    margin: 1,
  });
  await writeFile(outputPath, pngBuffer);
}

export type CoachQrCodeDto = {
  qrId: string;
  qrKey: string;
  status: string;
  imageUrl: string;
  scanUrl: string;
  updatedAt: string;
};

export async function getCoachAssignedQrCode(
  coachId: string,
  request?: Request,
): Promise<CoachQrCodeDto | null> {
  const qr = await prisma.qrCode.findFirst({
    where: { assignedCoachId: coachId, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    select: {
      publicId: true,
      qrKey: true,
      status: true,
      updatedAt: true,
    },
  });
  if (!qr) return null;

  const version = qr.updatedAt.getTime();
  return {
    qrId: qr.publicId,
    qrKey: qr.qrKey,
    status: qr.status,
    imageUrl: `/qrcode/${qr.publicId}?v=${version}`,
    scanUrl: buildPublicScanUrl(qr.publicId, request),
    updatedAt: qr.updatedAt.toISOString(),
  };
}

/** Génère (ou remplace) le QR code personnel d'un coach. */
export async function generateCoachQrCode(params: {
  coachId: string;
  createdByUserId: string;
  request?: Request;
}): Promise<CoachQrCodeDto> {
  const coach = await prisma.coach.findUnique({
    where: { id: params.coachId },
    select: { id: true, firstName: true, lastName: true, phone: true },
  });
  if (!coach) {
    throw new Error("COACH_NOT_FOUND");
  }
  if (!coach.phone?.trim()) {
    throw new Error("COACH_PHONE_REQUIRED");
  }

  const existing = await prisma.qrCode.findMany({
    where: { assignedCoachId: coach.id, status: { not: "ARCHIVED" } },
    select: { id: true },
  });
  if (existing.length > 0) {
    await prisma.qrCode.updateMany({
      where: { id: { in: existing.map((row) => row.id) } },
      data: { status: QrCodeStatus.ARCHIVED, assignedCoachId: null, assignedAt: null },
    });
  }

  const publicId = buildPublicId();
  const qrKey = await buildUniqueQrKey();
  const scanUrl = buildPublicScanUrl(publicId, params.request);
  const displayName = `${coach.firstName} ${coach.lastName}`.trim() || "Coach";

  const created = await prisma.qrCode.create({
    data: {
      publicId,
      qrKey,
      name: `Coach ${displayName}`,
      status: QrCodeStatus.ACTIVE,
      assignedCoach: { connect: { id: coach.id } },
      assignedAt: new Date(),
      createdByUser: { connect: { id: params.createdByUserId } },
    },
    select: {
      publicId: true,
      qrKey: true,
      status: true,
      updatedAt: true,
    },
  });

  await writeQrCodeFile({ publicId, targetUrl: scanUrl });

  const version = created.updatedAt.getTime();
  return {
    qrId: created.publicId,
    qrKey: created.qrKey,
    status: created.status,
    imageUrl: `/qrcode/${created.publicId}?v=${version}`,
    scanUrl,
    updatedAt: created.updatedAt.toISOString(),
  };
}
