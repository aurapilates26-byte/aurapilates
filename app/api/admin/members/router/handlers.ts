import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createMemberSchema, listMembersQuerySchema, renewMemberPackSchema, updateMemberSchema } from "./schemas";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { addPackDurationToStartDate } from "@/lib/pack-duration";

const db = prisma;

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function buildQrKey() {
  // 4 digits, cryptographically random (non-sequential).
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

async function buildUniqueQrKey(tx: typeof prisma | Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = buildQrKey();
    const existing = await tx.qrCode.findFirst({
      where: { qrKey: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("QR_KEY_POOL_EXHAUSTED");
}

async function resetMemberPackBalances(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string }
) {
  const pack = await tx.pack.findUnique({
    where: { id: input.packId },
    select: { id: true, sessionCount: true, courseQuotas: { select: { courseSlug: true, sessionCount: true } } },
  });
  if (!pack) return;

  await tx.memberPackBalance.deleteMany({ where: { memberId: input.memberId } });

  if (pack.courseQuotas.length > 0) {
    await tx.memberPackBalance.createMany({
      data: pack.courseQuotas.map((q) => ({
        memberId: input.memberId,
        packId: pack.id,
        courseSlug: q.courseSlug,
        remaining: q.sessionCount,
      })),
    });
    return;
  }

  if (pack.sessionCount != null) {
    await tx.memberPackBalance.create({
      data: { memberId: input.memberId, packId: pack.id, courseSlug: null, remaining: pack.sessionCount },
    });
  }
}

async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  if (session.user.role !== "ADMIN") {
    return { error: errorResponse("Forbidden", 403) };
  }

  return { session };
}

function mapMember(record: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  birthDate: Date | null;
  packStartedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { email: string } | null;
  pack: { id: string; name: string; durationDays: string | null } | null;
  assignedQrCodes: { publicId: string; status: string; updatedAt: Date }[];
}) {
  const qr = record.assignedQrCodes[0] ?? null;
  const packExpiresAt =
    record.packStartedAt && record.pack?.durationDays
      ? addPackDurationToStartDate(record.packStartedAt, record.pack.durationDays)
      : null;

  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    phone: record.phone,
    email: record.user?.email ?? null,
    birthDate: record.birthDate,
    pack: record.pack ? { id: record.pack.id, name: record.pack.name, durationDays: record.pack.durationDays } : null,
    packStartedAt: record.packStartedAt,
    packExpiresAt,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    qrCode: qr
      ? {
          qrId: qr.publicId,
          status: qr.status,
          updatedAt: qr.updatedAt,
        }
      : null,
  };
}

export async function listAdminMembers(request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const url = new URL(request.url);
  const parsedQuery = listMembersQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "10",
  });

  if (!parsedQuery.success) {
    return errorResponse("Invalid query parameters", 400);
  }

  const { search, page, pageSize } = parsedQuery.data;

  const where: Prisma.MemberWhereInput = search
    ? {
        OR: [
          { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.member.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { email: true } },
        pack: { select: { id: true, name: true, durationDays: true } },
        assignedQrCodes: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { publicId: true, status: true, updatedAt: true },
        },
      },
    }),
    db.member.count({ where }),
  ]);

  return Response.json({
    items: items.map(mapMember),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function createAdminMember(request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const rawBody = await request.json().catch(() => null);
  const parsedBody = createMemberSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return errorResponse("Invalid request payload", 400);
  }

  const { qrId, email, ...memberData } = parsedBody.data;

  const qr = await db.qrCode.findUnique({
    where: { publicId: qrId },
    select: { id: true, publicId: true, qrKey: true, assignedMemberId: true },
  });

  if (!qr) {
    return errorResponse("QR code not found", 404);
  }

  if (qr.assignedMemberId) {
    return errorResponse("QR code already assigned", 409);
  }

  const selectedPack = await db.pack.findUnique({
    where: { id: memberData.packId },
    select: { id: true, isActive: true },
  });
  if (!selectedPack) {
    return errorResponse("Pack not found", 404);
  }
  if (!selectedPack.isActive) {
    return errorResponse("Selected pack is inactive", 409);
  }

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    return errorResponse("Email already used", 409);
  }

  const created = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        role: "MEMBRE",
        name: `${memberData.firstName ?? ""} ${memberData.lastName ?? ""}`.trim() || null,
      },
    });

    const member = await tx.member.create({
      data: {
        userId: user.id,
        firstName: memberData.firstName ?? null,
        lastName: memberData.lastName ?? null,
        phone: memberData.phone ?? null,
        birthDate: memberData.birthDate ?? null,
        packId: memberData.packId,
        packStartedAt: new Date(),
        isActive: memberData.isActive ?? true,
      },
    });

    await resetMemberPackBalances(tx, { memberId: member.id, packId: memberData.packId });

    await tx.qrCode.update({
      where: { id: qr.id },
      data: {
        assignedMemberId: member.id,
        assignedAt: new Date(),
      },
    });

    const memberWithQr = await tx.member.findUniqueOrThrow({
      where: { id: member.id },
      include: {
        user: { select: { email: true } },
        pack: { select: { id: true, name: true, durationDays: true } },
        assignedQrCodes: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { publicId: true, status: true, updatedAt: true },
        },
      },
    });

    return { memberWithQr, qrKey: qr.qrKey };
  });

  // qrKey is only returned to admin interface here.
  return Response.json(
    {
      item: mapMember(created.memberWithQr),
      qr: {
        qrId,
        qrKey: created.qrKey,
      },
    },
    { status: 201 }
  );
}

export async function getAdminMemberById(id: string) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const item = await db.member.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      pack: { select: { id: true, name: true, durationDays: true } },
      assignedQrCodes: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { publicId: true, status: true, updatedAt: true },
      },
    },
  });

  if (!item) {
    return errorResponse("Member not found", 404);
  }

  return Response.json({ item: mapMember(item) });
}

export async function updateAdminMemberById(id: string, request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const rawBody = await request.json().catch(() => null);
  const parsedBody = updateMemberSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return errorResponse("Invalid request payload", 400);
  }

  const data = parsedBody.data;

  if (data.packId) {
    const selectedPack = await db.pack.findUnique({
      where: { id: data.packId },
      select: { id: true, isActive: true },
    });
    if (!selectedPack) {
      return errorResponse("Pack not found", 404);
    }
    if (!selectedPack.isActive) {
      return errorResponse("Selected pack is inactive", 409);
    }
  }

  const updated = await db.$transaction(async (tx) => {
    const memberCurrent = await tx.member.findUnique({
      where: { id },
      select: { packId: true },
    });
    if (!memberCurrent) {
      throw new Error("Member not found");
    }

    const shouldRefreshPackStart =
      data.packId !== undefined && data.packId !== null && data.packId !== memberCurrent.packId;

    const member = await tx.member.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName ?? null } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName ?? null } : {}),
        ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
        ...(data.birthDate !== undefined ? { birthDate: data.birthDate ?? null } : {}),
        ...(data.packId !== undefined ? { packId: data.packId } : {}),
        ...(shouldRefreshPackStart ? { packStartedAt: new Date() } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    if (shouldRefreshPackStart && data.packId) {
      await resetMemberPackBalances(tx, { memberId: member.id, packId: data.packId });
    }

    if (data.email !== undefined || data.firstName !== undefined || data.lastName !== undefined) {
      const memberUser = await tx.member.findUnique({
        where: { id: member.id },
        select: { userId: true },
      });

      if (memberUser?.userId) {
        const nextName =
          data.firstName !== undefined || data.lastName !== undefined
            ? `${data.firstName ?? member.firstName ?? ""} ${data.lastName ?? member.lastName ?? ""}`.trim() || null
            : undefined;

        await tx.user.update({
          where: { id: memberUser.userId },
          data: {
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(nextName !== undefined ? { name: nextName } : {}),
          },
        });
      }
    }

    if (data.qrId) {
      const qr = await tx.qrCode.findUnique({
        where: { publicId: data.qrId },
        select: { id: true, assignedMemberId: true },
      });

      if (!qr) {
        throw new Error("QR code not found");
      }

      if (qr.assignedMemberId && qr.assignedMemberId !== member.id) {
        throw new Error("QR code already assigned");
      }

      await tx.qrCode.updateMany({
        where: { assignedMemberId: member.id },
        data: { assignedMemberId: null, assignedAt: null },
      });

      await tx.qrCode.update({
        where: { id: qr.id },
        data: { assignedMemberId: member.id, assignedAt: new Date() },
      });
    }

    return tx.member.findUniqueOrThrow({
      where: { id: member.id },
      include: {
        user: { select: { email: true } },
        pack: { select: { id: true, name: true, durationDays: true } },
        assignedQrCodes: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { publicId: true, status: true, updatedAt: true },
        },
      },
    });
  });

  return Response.json({ item: mapMember(updated) });
}

export async function deleteAdminMemberById(id: string) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const member = await db.member.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!member) {
    return errorResponse("Member not found", 404);
  }

  try {
    await db.$transaction(async (tx) => {
      const assignedQrCodes = await tx.qrCode.findMany({
        where: { assignedMemberId: member.id },
        select: { id: true },
      });

      for (const qr of assignedQrCodes) {
        const newKey = await buildUniqueQrKey(tx);
        await tx.qrCode.update({
          where: { id: qr.id },
          data: {
            assignedMemberId: null,
            assignedAt: null,
            qrKey: newKey,
          },
        });
      }

      // Delete the member row explicitly (also cascades reservations/checkins/attendance).
      await tx.member.delete({ where: { id: member.id } });

      // If a user exists, delete it too (also cascades sessions, and would have cascaded member if not deleted above).
      if (member.userId) {
        await tx.user.delete({ where: { id: member.userId } });
      }
    });
  } catch {
    return errorResponse("Impossible de supprimer cet adherent (restrictions ou donnees liees).", 409);
  }

  return new Response(null, { status: 204 });
}

export async function renewAdminMemberPackById(id: string, request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const rawBody = await request.json().catch(() => null);
  const parsedBody = renewMemberPackSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return errorResponse("Invalid request payload", 400);
  }

  const { packId } = parsedBody.data;

  const selectedPack = await db.pack.findUnique({
    where: { id: packId },
    select: { id: true, isActive: true },
  });
  if (!selectedPack) {
    return errorResponse("Pack not found", 404);
  }
  if (!selectedPack.isActive) {
    return errorResponse("Selected pack is inactive", 409);
  }

  const now = new Date();
  let renewalStartAt = now;

  const updated = await db.$transaction(async (tx) => {
    const memberCurrent = await tx.member.findUnique({
      where: { id },
      select: {
        id: true,
        packStartedAt: true,
        pack: {
          select: {
            durationDays: true,
          },
        },
      },
    });

    if (!memberCurrent) {
      throw new Error("Member not found");
    }

    const previousPackExpiresAt =
      memberCurrent.packStartedAt && memberCurrent.pack?.durationDays
        ? addPackDurationToStartDate(memberCurrent.packStartedAt, memberCurrent.pack.durationDays)
        : null;
    renewalStartAt =
      previousPackExpiresAt && previousPackExpiresAt.getTime() > now.getTime() ? previousPackExpiresAt : now;

    const member = await tx.member.update({
      where: { id },
      data: { packId, packStartedAt: renewalStartAt },
      select: { id: true, packId: true },
    });

    if (member.packId) {
      await resetMemberPackBalances(tx, { memberId: member.id, packId: member.packId });
    }

    return tx.member.findUniqueOrThrow({
      where: { id: member.id },
      include: {
        user: { select: { email: true } },
        pack: { select: { id: true, name: true, durationDays: true } },
        assignedQrCodes: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { publicId: true, status: true, updatedAt: true },
        },
      },
    });
  });

  return Response.json({ item: mapMember(updated), renewalStartAt });
}

