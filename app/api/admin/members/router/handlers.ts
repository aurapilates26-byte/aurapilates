import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  completeMemberDepositSchema,
  createMemberSchema,
  listMembersQuerySchema,
  renewMemberPackSchema,
  updateMemberSchema,
} from "./schemas";
import { randomInt } from "crypto";
import {
  precomputePackPayment,
  recordAutoPackPaymentInTransaction,
  sumPackPaymentsForMemberPack,
  updateMemberPackPaymentMethodsInTransaction,
} from "@/lib/admin/pack-payment";
import { startOfLocalToday } from "@/lib/calendar-day";
import { displayMemberEmail } from "@/lib/member-display-email";
import { classifyMemberStatus, type MemberOperationalStatus } from "@/lib/member-status";
import { prisma } from "@/lib/prisma";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import { getMemberDetailById } from "@/lib/admin/member-detail-server";
import {
  completeMemberDepositEnrollment,
  computeExpectedPackAmountForCreate,
  recordDepositOnMemberCreate,
} from "@/lib/admin/member-deposit";
import { addParallelMemberPack } from "@/lib/admin/member-owned-packs";
import {
  decidePackRenewal,
  loadMemberPackState,
  packRenewalMessageFr,
  resetMemberPackBalancesForPack,
} from "@/lib/admin/member-pack-renewal";

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

async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  if (!isStaffRole(session.user.role)) {
    return { error: errorResponse("Forbidden", 403) };
  }

  return { session };
}

function mapMember(
  record: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    birthDate: Date | null;
    packStartedAt: Date | null;
    enrollmentStatus: "ACTIVE" | "DEPOSIT_PENDING";
    expectedPackAmountDinars: number | null;
    personalDiscountType: "PERCENT" | "AMOUNT" | null;
    personalDiscountValue: number | null;
    personalDiscountReason: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: { email: string } | null;
    pack: { id: string; name: string; durationDays: string | null } | null;
    assignedQrCodes: { publicId: string; qrKey: string; status: string; updatedAt: Date }[];
  },
  paymentTotals?: {
    totalPaid: number;
    depositPaid: number;
    depositPaymentMethod: "CASH" | "CHECK" | "TPE" | null;
    packPaymentMethod: "CASH" | "CHECK" | "TPE" | null;
  },
) {
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
    email: displayMemberEmail(record.user?.email ?? null),
    birthDate: record.birthDate,
    pack: record.pack ? { id: record.pack.id, name: record.pack.name, durationDays: record.pack.durationDays } : null,
    packStartedAt: record.packStartedAt,
    packExpiresAt,
    personalDiscount:
      record.personalDiscountType && record.personalDiscountValue != null
        ? {
            type: record.personalDiscountType,
            value: record.personalDiscountValue,
            reason: record.personalDiscountReason,
          }
        : null,
    isActive: record.isActive,
    enrollmentStatus: record.enrollmentStatus,
    expectedPackAmountDinars: record.expectedPackAmountDinars,
    totalPaidDinars: paymentTotals?.totalPaid ?? null,
    remainingDinars:
      record.expectedPackAmountDinars != null && paymentTotals
        ? Math.max(0, record.expectedPackAmountDinars - paymentTotals.totalPaid)
        : null,
    depositPaymentMethod: paymentTotals?.depositPaymentMethod ?? null,
    packPaymentMethod: paymentTotals?.packPaymentMethod ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    qrCode: qr
      ? {
          qrId: qr.publicId,
          qrKey: qr.qrKey || null,
          status: qr.status,
          updatedAt: qr.updatedAt,
        }
      : null,
  };
}

const memberListInclude = {
  user: { select: { email: true } },
  pack: { select: { id: true, name: true, durationDays: true } },
  packPayments: { select: { amountDinars: true, packId: true, paymentKind: true, paymentMethod: true } },
  assignedQrCodes: {
    orderBy: { updatedAt: "desc" as const },
    take: 1,
    select: { publicId: true, qrKey: true, status: true, updatedAt: true },
  },
} satisfies Prisma.MemberInclude;

function paymentTotalsForMemberRow(member: MemberListRow): {
  totalPaid: number;
  depositPaid: number;
  depositPaymentMethod: "CASH" | "CHECK" | "TPE" | null;
  packPaymentMethod: "CASH" | "CHECK" | "TPE" | null;
} {
  if (!member.packId) {
    return { totalPaid: 0, depositPaid: 0, depositPaymentMethod: null, packPaymentMethod: null };
  }

  let totalPaid = 0;
  let depositPaid = 0;
  let depositPaymentMethod: "CASH" | "CHECK" | "TPE" | null = null;
  let fullPaymentMethod: "CASH" | "CHECK" | "TPE" | null = null;
  let balancePaymentMethod: "CASH" | "CHECK" | "TPE" | null = null;

  for (const p of member.packPayments) {
    if (p.packId !== member.packId) continue;
    totalPaid += p.amountDinars;
    if (p.paymentKind === "DEPOSIT") {
      depositPaid += p.amountDinars;
      depositPaymentMethod = p.paymentMethod;
    }
    if (p.paymentKind === "FULL") {
      fullPaymentMethod = p.paymentMethod;
    }
    if (p.paymentKind === "BALANCE") {
      balancePaymentMethod = p.paymentMethod;
    }
  }

  const packPaymentMethod = fullPaymentMethod ?? balancePaymentMethod ?? depositPaymentMethod;

  return { totalPaid, depositPaid, depositPaymentMethod, packPaymentMethod };
}

function mapMemberListRow(member: MemberListRow) {
  return mapMember(member, paymentTotalsForMemberRow(member));
}

type MemberListRow = Prisma.MemberGetPayload<{ include: typeof memberListInclude }>;

function memberOperationalStatusFromRow(member: MemberListRow): MemberOperationalStatus {
  return classifyMemberStatus({
    isActive: member.isActive,
    packId: member.packId,
    packStartedAt: member.packStartedAt,
    pack: member.pack ? { durationDays: member.pack.durationDays } : null,
  });
}

function matchesStatusFilter(status: MemberOperationalStatus, filter: string): boolean {
  if (filter === "ALL") return true;
  if (filter === "ACTIVE") return status === "active";
  if (filter === "PENDING") return status === "pending";
  if (filter === "EXPIRED") return status === "expired";
  if (filter === "NO_PACK") return status === "no_pack";
  return true;
}

export async function listAdminMembers(request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const url = new URL(request.url);
  const parsedQuery = listMembersQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? "ALL",
    enrollment: url.searchParams.get("enrollment") ?? "ACTIVE",
    packId: url.searchParams.get("packId") ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "20",
  });

  if (!parsedQuery.success) {
    return errorResponse("Invalid query parameters", 400);
  }

  const { search, status, enrollment, packId, page, pageSize } = parsedQuery.data;

  const where: Prisma.MemberWhereInput = {};

  if (enrollment !== "ALL") {
    where.enrollmentStatus = enrollment;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
    ];
  }

  if (packId) {
    where.packId = packId;
  }

  const orderBy = { updatedAt: "desc" as const };
  const needsStatusFilter = status !== "ALL";

  let rows: MemberListRow[];
  let total: number;

  if (needsStatusFilter) {
    const all = await db.member.findMany({
      where,
      orderBy,
      include: memberListInclude,
    });
    const filtered = all.filter((member) => matchesStatusFilter(memberOperationalStatusFromRow(member), status));
    total = filtered.length;
    rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  } else {
    const [pageRows, count] = await Promise.all([
      db.member.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: memberListInclude,
      }),
      db.member.count({ where }),
    ]);
    rows = pageRows;
    total = count;
  }

  return Response.json({
    items: rows.map(mapMemberListRow),
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

  const { qrId, email, personalDiscount, paymentMode, depositAmountDinars, paymentMethod, ...memberData } = parsedBody.data;
  const isDepositMode = paymentMode === "deposit";

  if (isDepositMode && qrId) {
    return errorResponse("Le QR code est assigné lors de la finalisation du paiement (acompte).", 400);
  }

  let qr: { id: string; publicId: string; qrKey: string; assignedMemberId: string | null } | null = null;
  if (qrId) {
    const qrRow = await db.qrCode.findUnique({
      where: { publicId: qrId },
      select: { id: true, publicId: true, qrKey: true, assignedMemberId: true },
    });

    if (!qrRow) {
      return errorResponse("QR code not found", 404);
    }

    if (qrRow.assignedMemberId) {
      return errorResponse("QR code already assigned", 409);
    }

    qr = qrRow;
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

  if (email) {
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return errorResponse("Email already used", 409);
    }
  }

  const paymentPrecomputed = await precomputePackPayment(memberData.packId, startOfLocalToday());
  if (!paymentPrecomputed) {
    return errorResponse("Ce pack n'a pas de prix catalogue : impossible d'enregistrer un paiement.", 409);
  }

  const personalDiscountInput =
    personalDiscount != null ? { type: personalDiscount.type, value: personalDiscount.value } : null;

  if (personalDiscount) {
    const baseAmount = paymentPrecomputed.resolved.amountDinars;
    if (personalDiscount.type === "PERCENT" && personalDiscount.value > 100) {
      return errorResponse("La remise en pourcentage doit être entre 1 et 100.", 400);
    }
    if (personalDiscount.type === "AMOUNT" && personalDiscount.value > baseAmount) {
      return errorResponse("La remise ne peut pas dépasser le montant à encaisser.", 400);
    }
  }

  const expectedPackAmountDinars = computeExpectedPackAmountForCreate(paymentPrecomputed, personalDiscountInput);

  if (isDepositMode) {
    if (depositAmountDinars == null) {
      return errorResponse("Indiquez le montant de l'acompte.", 400);
    }
    if (depositAmountDinars >= expectedPackAmountDinars) {
      return errorResponse("L'acompte doit être inférieur au montant total du pack.", 400);
    }
  }

  const adminUserId = sessionResult.session.user.id;

  const created = await db.$transaction(async (tx) => {
    let userId: string | null = null;
    if (email) {
      const user = await tx.user.create({
        data: {
          email,
          role: "MEMBRE",
          name: `${memberData.firstName ?? ""} ${memberData.lastName ?? ""}`.trim() || null,
        },
      });
      userId = user.id;
    }

    const member = await tx.member.create({
      data: {
        userId,
        firstName: memberData.firstName ?? null,
        lastName: memberData.lastName ?? null,
        phone: memberData.phone ?? null,
        birthDate: memberData.birthDate ?? null,
        packId: memberData.packId,
        packStartedAt: null,
        personalDiscountType: personalDiscount?.type ?? null,
        personalDiscountValue: personalDiscount?.value ?? null,
        personalDiscountReason: personalDiscount?.reason?.trim() || null,
        enrollmentStatus: isDepositMode ? "DEPOSIT_PENDING" : "ACTIVE",
        expectedPackAmountDinars: isDepositMode ? expectedPackAmountDinars : null,
        isActive: memberData.isActive ?? false,
      },
    });

    await resetMemberPackBalancesForPack(tx, { memberId: member.id, packId: memberData.packId });

    if (isDepositMode) {
      await recordDepositOnMemberCreate({
        tx,
        memberId: member.id,
        packId: memberData.packId,
        depositAmountDinars: depositAmountDinars!,
        expectedPackAmountDinars,
        recordedByUserId: adminUserId,
        precomputed: paymentPrecomputed,
        paymentMethod,
      });
    } else {
      const noteParts = ["Création adhérente"];
      if (personalDiscount?.reason) {
        noteParts.push(`Remise perso: ${personalDiscount.reason}`);
      }
      await recordAutoPackPaymentInTransaction(tx, {
        memberId: member.id,
        packId: memberData.packId,
        recordedByUserId: adminUserId,
        precomputed: paymentPrecomputed,
        personalDiscount: personalDiscountInput,
        note: noteParts.join(" · "),
        paymentKind: "FULL",
        paymentMethod,
      });
    }

    if (qr) {
      await tx.qrCode.update({
        where: { id: qr.id },
        data: {
          assignedMemberId: member.id,
          assignedAt: new Date(),
          status: "ACTIVE",
        },
      });
    }

    const memberWithQr = await tx.member.findUniqueOrThrow({
      where: { id: member.id },
      include: {
        user: { select: { email: true } },
        pack: { select: { id: true, name: true, durationDays: true } },
        assignedQrCodes: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { publicId: true, qrKey: true, status: true, updatedAt: true },
        },
      },
    });

    return { memberWithQr, qrKey: qr?.qrKey ?? null };
  });

  const paymentTotals = await sumPackPaymentsForMemberPack(created.memberWithQr.id, memberData.packId);

  return Response.json(
    {
      item: mapMember(created.memberWithQr, paymentTotals),
      qr: qr
        ? {
            qrId: qr.publicId,
            qrKey: created.qrKey,
          }
        : null,
    },
    { status: 201 }
  );
}

export async function getAdminMemberById(id: string) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const item = await getMemberDetailById(id);
  if (!item) {
    return errorResponse("Member not found", 404);
  }

  return Response.json({ item });
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

  const memberBeforePack = await db.member.findUnique({
    where: { id },
    select: {
      packId: true,
      personalDiscountType: true,
      personalDiscountValue: true,
      personalDiscountReason: true,
    },
  });
  if (!memberBeforePack) {
    return errorResponse("Member not found", 404);
  }

  const shouldRefreshPackStart =
    data.packId !== undefined && data.packId !== null && data.packId !== memberBeforePack.packId;

  const effectivePersonalDiscount =
    data.personalDiscount === undefined
      ? (memberBeforePack.personalDiscountType && memberBeforePack.personalDiscountValue != null
          ? { type: memberBeforePack.personalDiscountType, value: memberBeforePack.personalDiscountValue }
          : null)
      : data.personalDiscount
        ? { type: data.personalDiscount.type, value: data.personalDiscount.value }
        : null;

  const paymentPrecomputed =
    shouldRefreshPackStart && data.packId
      ? await precomputePackPayment(data.packId, startOfLocalToday())
      : null;
  const adminUserId = sessionResult.session.user.id;

  const packStateBeforeUpdate = shouldRefreshPackStart
    ? await loadMemberPackState(db, id)
    : null;
  const packChangeDecision = packStateBeforeUpdate ? decidePackRenewal(packStateBeforeUpdate) : null;
  const queuePackChange = packChangeDecision?.mode === "queued";

  await db.$transaction(async (tx) => {
    const memberCurrent = await tx.member.findUnique({
      where: { id },
      select: { packId: true },
    });
    if (!memberCurrent) {
      throw new Error("Member not found");
    }

    const member = await tx.member.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName ?? null } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName ?? null } : {}),
        ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
        ...(data.birthDate !== undefined ? { birthDate: data.birthDate ?? null } : {}),
        ...(data.packId !== undefined && !queuePackChange ? { packId: data.packId } : {}),
        ...(shouldRefreshPackStart && !queuePackChange ? { packStartedAt: null } : {}),
        ...(data.personalDiscount !== undefined
          ? data.personalDiscount
            ? {
                personalDiscountType: data.personalDiscount.type,
                personalDiscountValue: data.personalDiscount.value,
                personalDiscountReason: data.personalDiscount.reason?.trim() || null,
              }
            : {
                personalDiscountType: null,
                personalDiscountValue: null,
                personalDiscountReason: null,
              }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    if (shouldRefreshPackStart && data.packId) {
      const decision = packChangeDecision ?? { mode: "immediate" as const };

      if (queuePackChange) {
        await addParallelMemberPack(tx, { memberId: member.id, packId: data.packId });
      } else {
        await tx.member.update({
          where: { id: member.id },
          data: { packId: data.packId, packStartedAt: null, isActive: false },
        });
        await resetMemberPackBalancesForPack(tx, { memberId: member.id, packId: data.packId });
      }

      if (paymentPrecomputed) {
        await recordAutoPackPaymentInTransaction(tx, {
          memberId: member.id,
          packId: data.packId,
          recordedByUserId: adminUserId,
          precomputed: paymentPrecomputed,
          personalDiscount: effectivePersonalDiscount,
          note: decision.mode === "queued" ? "Changement de pack (pack parallèle)" : "Changement de pack",
          paymentMethod: data.paymentMethod,
        });
      }
    }

    const targetPackIdForPayment =
      data.packId !== undefined && !queuePackChange ? data.packId : memberCurrent.packId;

    if (data.paymentMethod && targetPackIdForPayment && !shouldRefreshPackStart) {
      await updateMemberPackPaymentMethodsInTransaction(
        tx,
        member.id,
        targetPackIdForPayment,
        data.paymentMethod,
      );
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
        data: { assignedMemberId: member.id, assignedAt: new Date(), status: "ACTIVE" },
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
          select: { publicId: true, qrKey: true, status: true, updatedAt: true },
        },
      },
    });
  });

  const detail = await getMemberDetailById(id);
  if (!detail) {
    return errorResponse("Member not found", 404);
  }

  return Response.json({ item: detail });
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
    return errorResponse("Impossible de supprimer cette adhérente (restrictions ou données liées).", 409);
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

  const { packId, personalDiscount, paymentMode, depositAmountDinars, paymentMethod } = parsedBody.data;
  const isDepositMode = paymentMode === "deposit";

  const selectedPack = await db.pack.findUnique({
    where: { id: packId },
    select: { id: true, name: true, isActive: true },
  });
  if (!selectedPack) {
    return errorResponse("Pack not found", 404);
  }
  if (!selectedPack.isActive) {
    return errorResponse("Selected pack is inactive", 409);
  }

  const packStateBefore = await loadMemberPackState(db, id);
  if (!packStateBefore) {
    return errorResponse("Member not found", 404);
  }

  const decision = decidePackRenewal(packStateBefore);
  const paymentPrecomputed = await precomputePackPayment(packId, startOfLocalToday());
  if (!paymentPrecomputed) {
    return errorResponse("Ce pack n'a pas de prix catalogue : impossible d'enregistrer un paiement.", 409);
  }

  const personalDiscountInput =
    personalDiscount != null ? { type: personalDiscount.type, value: personalDiscount.value } : null;

  if (personalDiscount) {
    const baseAmount = paymentPrecomputed.resolved.amountDinars;
    if (personalDiscount.type === "PERCENT" && personalDiscount.value > 100) {
      return errorResponse("La remise en pourcentage doit être entre 1 et 100.", 400);
    }
    if (personalDiscount.type === "AMOUNT" && personalDiscount.value > baseAmount) {
      return errorResponse("La remise ne peut pas dépasser le montant à encaisser.", 400);
    }
  }

  const expectedPackAmountDinars = computeExpectedPackAmountForCreate(
    paymentPrecomputed,
    personalDiscountInput,
  );

  if (isDepositMode) {
    if (depositAmountDinars == null) {
      return errorResponse("Indiquez le montant de l'acompte.", 400);
    }
    if (depositAmountDinars >= expectedPackAmountDinars) {
      return errorResponse("L'acompte doit être inférieur au montant total du pack.", 400);
    }
  }

  const adminUserId = sessionResult.session.user.id;

  await db.$transaction(async (tx) => {
    const memberCurrent = await tx.member.findUnique({
      where: { id },
      select: { id: true, personalDiscountType: true, personalDiscountValue: true },
    });

    if (!memberCurrent) {
      throw new Error("Member not found");
    }

    if (decision.mode === "queued") {
      await addParallelMemberPack(tx, { memberId: id, packId });
    } else {
      await tx.member.update({
        where: { id },
        data: { packId, packStartedAt: null, isActive: false },
      });
      await resetMemberPackBalancesForPack(tx, { memberId: id, packId });
    }

    await tx.member.update({
      where: { id },
      data: {
        personalDiscountType: personalDiscount?.type ?? null,
        personalDiscountValue: personalDiscount?.value ?? null,
        personalDiscountReason: personalDiscount?.reason?.trim() || null,
        ...(isDepositMode
          ? {
              enrollmentStatus: "DEPOSIT_PENDING",
              expectedPackAmountDinars,
              isActive: false,
            }
          : {
              enrollmentStatus: "ACTIVE",
              expectedPackAmountDinars: null,
            }),
      },
    });

    if (isDepositMode) {
      await recordDepositOnMemberCreate({
        tx,
        memberId: id,
        packId,
        depositAmountDinars: depositAmountDinars!,
        expectedPackAmountDinars,
        recordedByUserId: adminUserId,
        precomputed: paymentPrecomputed,
        paymentMethod,
      });
    } else {
      const noteParts = [
        decision.mode === "queued" ? "Renouvellement pack (pack parallèle)" : "Renouvellement pack",
      ];
      if (personalDiscount?.reason) {
        noteParts.push(`Remise perso: ${personalDiscount.reason}`);
      }
      await recordAutoPackPaymentInTransaction(tx, {
        memberId: id,
        packId,
        recordedByUserId: adminUserId,
        precomputed: paymentPrecomputed,
        personalDiscount: personalDiscountInput,
        note: noteParts.join(" · "),
        paymentKind: "FULL",
        paymentMethod,
      });
    }

  });

  const item = await getMemberDetailById(id);
  if (!item) {
    return errorResponse("Member not found", 404);
  }

  return Response.json({
    item,
    renewal: {
      mode: decision.mode,
      remainingSessions: decision.remainingSessions,
      isExpired: decision.isExpired,
      message: packRenewalMessageFr(decision, selectedPack.name),
    },
    pendingPacks: item.pendingPacks,
  });
}

export async function completeAdminMemberDepositById(id: string, request: Request) {
  const sessionResult = await requireAdminSession();
  if ("error" in sessionResult) return sessionResult.error;

  const rawBody = await request.json().catch(() => ({}));
  const parsedBody = completeMemberDepositSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return errorResponse("Invalid request payload", 400);
  }

  const { qrId, paymentMethod } = parsedBody.data;
  const adminUserId = sessionResult.session.user.id;

  const updated = await completeMemberDepositEnrollment({
    memberId: id,
    qrId,
    paymentMethod,
    recordedByUserId: adminUserId,
  });
  if (!updated) return errorResponse("Member not found", 404);

  const paymentTotals = updated.packId
    ? await sumPackPaymentsForMemberPack(updated.id, updated.packId)
    : { totalPaid: 0, depositPaid: 0, depositPaymentMethod: null, packPaymentMethod: null };

  return Response.json({ item: mapMember(updated, paymentTotals) });
}

