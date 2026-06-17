import "server-only";

import {
  addLocalDays,
  formatYmdLocal,
  prismaDateInclusiveUtcRange,
  prismaDayOfWeekLocalNow,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { aggregateMemberStatusCounts } from "@/lib/member-status";
import { packExpiresAtLocal } from "@/lib/member-pack-period";
import {
  PACK_CATEGORY_OPTIONS,
  normalizePackCategory,
  packCategoryMenuLabel,
} from "@/lib/pack-categories";
import { prisma } from "@/lib/prisma";
import type {
  AdminOverviewDetails,
  AdminOverviewExpiringPack,
  AdminOverviewPackCategoryGroup,
  AdminOverviewPackLine,
  AdminOverviewPulseCards,
  AdminOverviewReservationPeriod,
  AdminOverviewSnapshot,
  AdminOverviewWatchItem,
} from "@/types/admin/overview";

const EXPIRING_PACK_DAYS = 7;

function memberDisplayName(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Adhérent";
}

function formatDayLabelFr(d: Date): string {
  const raw = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return raw ? `${raw.charAt(0).toUpperCase()}${raw.slice(1)}` : formatYmdLocal(d);
}

function formatShortDateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatMonthYearFr(d: Date): string {
  const raw = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return raw ? `${raw.charAt(0).toUpperCase()}${raw.slice(1)}` : formatYmdLocal(d);
}

function formatInclusiveRangeLabelFr(from: Date, to: Date): string {
  return `du ${formatShortDateFr(from)} au ${formatShortDateFr(to)}`;
}

function aggregateReservations(rows: { status: string }[]): AdminOverviewReservationPeriod {
  let booked = 0;
  let waitlist = 0;
  let attended = 0;
  let cancelled = 0;
  for (const r of rows) {
    if (r.status === "BOOKED") booked += 1;
    else if (r.status === "WAITLIST") waitlist += 1;
    else if (r.status === "ATTENDED") attended += 1;
    else if (r.status === "CANCELLED") cancelled += 1;
  }
  const enrolled = booked + waitlist + attended;
  const presenceRatePct = enrolled > 0 ? Math.round((attended / enrolled) * 100) : null;
  return {
    booked,
    waitlist,
    attended,
    cancelled,
    totalActive: enrolled,
    presenceRatePct,
  };
}

function aggregateFromStatusCounts(
  counts: { status: string; _count: { _all: number } }[],
): AdminOverviewReservationPeriod {
  const rows = counts.flatMap((c) =>
    Array.from({ length: c._count._all }, () => ({ status: c.status })),
  );
  return aggregateReservations(rows);
}

type PackOverviewRow = {
  id: string;
  name: string;
  category: string | null;
  isActive: boolean;
  assignedMemberCount: number;
};

function buildPackPurchaserCounts(
  payments: { packId: string; memberId: string }[],
): Map<string, number> {
  const byPack = new Map<string, Set<string>>();
  for (const row of payments) {
    let members = byPack.get(row.packId);
    if (!members) {
      members = new Set();
      byPack.set(row.packId, members);
    }
    members.add(row.memberId);
  }
  const counts = new Map<string, number>();
  for (const [packId, members] of byPack.entries()) {
    counts.set(packId, members.size);
  }
  return counts;
}

function toPackLine(row: PackOverviewRow, purchaserCounts: Map<string, number>): AdminOverviewPackLine {
  const purchased = purchaserCounts.get(row.id) ?? 0;
  const memberCount = purchased > 0 ? purchased : row.assignedMemberCount;
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    memberCount,
  };
}

function buildPackOverviewStats(
  rows: PackOverviewRow[],
  purchaserCounts: Map<string, number>,
): {
  pulse: AdminOverviewPulseCards["packs"];
  details: AdminOverviewDetails["packs"];
} {
  const packsByCategoryKey = new Map<string, AdminOverviewPackLine[]>();
  const withoutCategoryPacks: AdminOverviewPackLine[] = [];
  let activePacks = 0;

  for (const row of rows) {
    if (row.isActive) activePacks += 1;
    const line = toPackLine(row, purchaserCounts);
    const raw = row.category?.trim();
    if (!raw) {
      withoutCategoryPacks.push(line);
      continue;
    }
    const key = normalizePackCategory(raw) || raw;
    const list = packsByCategoryKey.get(key) ?? [];
    list.push(line);
    packsByCategoryKey.set(key, list);
  }

  const sortByName = (a: AdminOverviewPackLine, b: AdminOverviewPackLine) =>
    a.name.localeCompare(b.name, "fr");

  for (const list of packsByCategoryKey.values()) {
    list.sort(sortByName);
  }
  withoutCategoryPacks.sort(sortByName);

  const byCategory: AdminOverviewPackCategoryGroup[] = PACK_CATEGORY_OPTIONS.map((opt) => ({
    category: opt.value,
    label: opt.label,
    packs: [...(packsByCategoryKey.get(opt.value) ?? [])].sort(sortByName),
  }));

  for (const [category, packs] of packsByCategoryKey.entries()) {
    if (PACK_CATEGORY_OPTIONS.some((o) => o.value === category)) continue;
    byCategory.push({
      category,
      label: packCategoryMenuLabel(category),
      packs: [...packs].sort(sortByName),
    });
  }

  return {
    pulse: {
      categoriesCount: PACK_CATEGORY_OPTIONS.length,
      packsTotal: rows.length,
      activePacks,
    },
    details: {
      byCategory,
      withoutCategory: withoutCategoryPacks.length,
      withoutCategoryPacks,
    },
  };
}

export async function fetchAdminOverviewSnapshot(greetingName: string | null): Promise<AdminOverviewSnapshot> {
  const now = new Date();
  const today = startOfLocalToday();
  const todayYmd = formatYmdLocal(today);
  const todayDow = prismaDayOfWeekLocalNow();
  const sevenDaysAgo = addLocalDays(today, -6);
  const expiringUntil = addLocalDays(today, EXPIRING_PACK_DAYS);
  const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const fifteenDaysAgo = addLocalDays(today, -14);

  const [
    planningSlotsTotal,
    planningSlotsToday,
    membersForStatus,
    membersNew7d,
    membersNew15d,
    membersNewLastMonth,
    membersLowBalance,
    membersWithoutQr,
    qrAssigned,
    qrTotal,
    reservationsGlobalCounts,
    reservationsTodayRows,
    membersExpiring,
    renewedMemberPayments,
    allPacks,
    packPaymentsForCounts,
  ] = await Promise.all([
    prisma.planning.count(),
    prisma.planning.count({ where: { dayOfWeek: todayDow } }),
    prisma.member.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
        packId: true,
        packStartedAt: true,
        pack: { select: { name: true, durationDays: true } },
      },
    }),
    prisma.member.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.member.count({ where: { createdAt: { gte: addLocalDays(today, -14) } } }),
    prisma.member.count({
      where: { createdAt: { gte: firstOfLastMonth, lt: firstOfThisMonth } },
    }),
    prisma.member.count({
      where: { packBalances: { some: { remaining: { lte: 1 } } } },
    }),
    prisma.member.count({ where: { assignedQrCodes: { none: {} } } }),
    prisma.qrCode.count({ where: { assignedMemberId: { not: null } } }),
    prisma.qrCode.count(),
    prisma.reservation.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.reservation.findMany({
      where: { sessionDate: prismaDateInclusiveUtcRange(today, today) },
      select: { status: true },
    }),
    prisma.member.findMany({
      where: { packId: { not: null }, packStartedAt: { not: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        packStartedAt: true,
        pack: { select: { name: true, durationDays: true } },
      },
    }),
    prisma.packPayment.findMany({
      where: { note: { startsWith: "Renouvellement pack" } },
      select: { memberId: true },
      distinct: ["memberId"],
    }),
    prisma.pack.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.packPayment.findMany({
      select: { packId: true, memberId: true },
    }),
  ]);

  const packPurchaserCounts = buildPackPurchaserCounts(packPaymentsForCounts);
  const packRows: PackOverviewRow[] = allPacks.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    isActive: p.isActive,
    assignedMemberCount: p._count.members,
  }));
  const packStats = buildPackOverviewStats(packRows, packPurchaserCounts);

  const reservationsGlobal = aggregateFromStatusCounts(reservationsGlobalCounts);
  const reservationsToday = aggregateReservations(reservationsTodayRows);

  const memberStatusCounts = aggregateMemberStatusCounts(membersForStatus, today);
  const expiringCandidates: AdminOverviewExpiringPack[] = [];
  const todayStart = today.getTime();
  const expiringEnd = expiringUntil.getTime();

  for (const m of membersExpiring) {
    if (!m.packStartedAt || !m.pack) continue;
    const expires = packExpiresAtLocal(m.packStartedAt, m.pack.durationDays);
    if (!expires) continue;
    const expTime = expires.getTime();
    if (expTime < todayStart || expTime > expiringEnd) continue;
    expiringCandidates.push({
      memberId: m.id,
      memberName: memberDisplayName(m.firstName, m.lastName),
      packName: m.pack.name,
      expiresYmd: formatYmdLocal(expires),
      daysLeft: Math.max(0, Math.ceil((expTime - todayStart) / (24 * 60 * 60 * 1000))),
    });
  }
  const expiringPacks = expiringCandidates.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8);
  const expiringThisWeek = expiringCandidates.length;

  const pulse: AdminOverviewPulseCards = {
    members: {
      total: memberStatusCounts.total,
      active: memberStatusCounts.active,
      pending: memberStatusCounts.pending,
      expired: memberStatusCounts.expired,
      renewed: renewedMemberPayments.length,
      noPack: memberStatusCounts.noPack,
    },
    qr: {
      assigned: qrAssigned,
      total: qrTotal,
      available: Math.max(0, qrTotal - qrAssigned),
    },
    packs: packStats.pulse,
    presence: {
      totalAttended: reservationsGlobal.attended,
    },
    planning: {
      slotsTotal: planningSlotsTotal,
      slotsToday: planningSlotsToday,
    },
    presenceRate: {
      pct: reservationsGlobal.presenceRatePct,
    },
  };

  const details: AdminOverviewDetails = {
    members: {
      newLast7Days: membersNew7d,
      newLast15Days: membersNew15d,
      newLastMonth: membersNewLastMonth,
      last7dRangeLabel: formatInclusiveRangeLabelFr(sevenDaysAgo, today),
      last15dRangeLabel: formatInclusiveRangeLabelFr(fifteenDaysAgo, today),
      lastMonthLabel: formatMonthYearFr(firstOfLastMonth),
    },
    qr: { membersWithoutQr },
    packs: packStats.details,
    reservations: {
      global: reservationsGlobal,
      today: reservationsToday,
    },
    planning: { slotsToday: planningSlotsToday },
  };

  const watchItems: AdminOverviewWatchItem[] = [];

  if (reservationsToday.waitlist > 0) {
    watchItems.push({
      id: "waitlist-today",
      variant: "attention",
      title: "Liste d'attente aujourd'hui",
      description: `${reservationsToday.waitlist} inscription${reservationsToday.waitlist > 1 ? "s" : ""} en attente sur les cours du jour.`,
      href: `/dashboard/reservations-admin?date=${todayYmd}`,
    });
  }

  if (membersLowBalance > 0) {
    watchItems.push({
      id: "low-balance",
      variant: "attention",
      title: "Séances presque épuisées",
      description: `${membersLowBalance} adhérent${membersLowBalance > 1 ? "s" : ""} avec une ou zéro séance restante.`,
      href: "/dashboard/adherents",
    });
  }

  if (expiringThisWeek > 0 && expiringPacks.length > 0) {
    watchItems.push({
      id: "expiring-packs",
      variant: "info",
      title: "Renouvellements à prévoir",
      description: `${expiringThisWeek} pack${expiringThisWeek > 1 ? "s" : ""} expire${expiringThisWeek > 1 ? "nt" : ""} dans les 7 prochains jours.`,
      href: "/dashboard/adherents",
    });
  }

  return {
    generatedAt: now.toISOString(),
    todayYmd,
    dayLabel: formatDayLabelFr(today),
    greetingName,
    pulse,
    details,
    watchItems,
    expiringPacks,
    expiringThisWeek,
  };
}
