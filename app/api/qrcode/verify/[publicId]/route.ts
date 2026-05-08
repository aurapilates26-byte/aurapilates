import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { z } from "zod";
import { formatYmdLocal } from "@/lib/calendar-day";

const db = new PrismaClient();

const staffKeyHashEnv = process.env.STAFF_QR_KEY_HASH;

const verifySchema = z.object({
  key: z.string().min(1),
});

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Params = {
  params: Promise<{ publicId: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { publicId } = await params;

  const rawBody = await _request.json().catch(() => null);
  const parsed = verifySchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Payload invalide", 400);
  }

  const { key } = parsed.data;

  const qr = await db.qrCode.findUnique({
    where: { publicId },
    select: {
      id: true,
      publicId: true,
      qrKey: true,
      assignedMemberId: true,
    },
  });

  if (!qr) {
    return errorResponse("QR code introuvable", 404);
  }

  if (!qr.assignedMemberId) {
    return errorResponse("QR non affecte", 409);
  }

  // Auto-detect: si la clé correspond à la clé staff, on enregistre une présence.
  // Sinon, on tente la clé QR pour afficher les infos membre.
  if (staffKeyHashEnv && sha256(key) === staffKeyHashEnv) {
    const member = await db.member.findUnique({
      where: { id: qr.assignedMemberId },
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        birthDate: true,
        isActive: true,
        pack: { select: { name: true } },
      },
    });

    if (!member) {
      return errorResponse("Membre introuvable", 404);
    }

    return Response.json({
      kind: "STAFF_CHALLENGE_OK",
      message:
        "Cle staff reconnue — utilisez la page Presence du dashboard pour marquer les participants sur la liste.",
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
        pack: member.pack ? { name: member.pack.name } : null,
      },
    });
  }

  if (!qr.qrKey || key !== qr.qrKey) {
    return errorResponse("Clé invalide", 403);
  }

  const member = await db.member.findUnique({
    where: { id: qr.assignedMemberId },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      birthDate: true,
      isActive: true,
      pack: { select: { name: true } },
    },
  });

  if (!member) {
    return errorResponse("Membre introuvable", 404);
  }

  return Response.json({
    kind: "MEMBER_INFO",
    member: {
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      // birthDate est un DateTime: on renvoie un YYYY-MM-DD en fuseau local pour éviter les décalages.
      birthDate: member.birthDate ? formatYmdLocal(new Date(member.birthDate)) : null,
      pack: member.pack ? { name: member.pack.name } : null,
      isActive: member.isActive,
    },
  });
}

