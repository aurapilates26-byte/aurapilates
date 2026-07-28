import { courseLabel } from "@/lib/course-labels";
import { formatYmdPrismaDate } from "@/lib/calendar-day";
import { formatUserDisplayName } from "@/lib/reservation-created-by";

type ReservationWithPlanning = {
  id: string;
  status: string;
  sessionDate: Date;
  createdAt: Date;
  packRefundedAt: Date | null;
  source: "ADMIN" | "MEMBER" | null;
  debitedPackId: string | null;
  debitedPack: { id: string; name: string } | null;
  planning: {
    id: string;
    courseSlug: string;
    startTime: string;
    endTime: string;
    level: string | null;
    coach: { firstName: string; lastName: string; imageUrl?: string | null } | null;
  };
  createdByUser: { name: string | null; email: string; role: string } | null;
};

export type AdminMemberReservationItem = {
  id: string;
  status: string;
  sessionDate: string;
  reservedAt: string;
  packRefundedAt: string | null;
  source: "ADMIN" | "MEMBER" | null;
  debitedPackId: string | null;
  debitedPackName: string | null;
  createdByName: string | null;
  createdByRole: string | null;
  planning: {
    id: string;
    courseSlug: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string | null;
    coachName: string | null;
    coachImageUrl: string | null;
  };
};

export const adminMemberReservationInclude = {
  planning: {
    include: {
      coach: { select: { firstName: true, lastName: true, imageUrl: true } },
    },
  },
  createdByUser: { select: { name: true, email: true, role: true } },
  debitedPack: { select: { id: true, name: true } },
} as const;

export function serializeAdminMemberReservation(r: ReservationWithPlanning): AdminMemberReservationItem {
  return {
    id: r.id,
    status: r.status,
    sessionDate: formatYmdPrismaDate(new Date(r.sessionDate)),
    reservedAt: r.createdAt.toISOString(),
    packRefundedAt: r.packRefundedAt ? r.packRefundedAt.toISOString() : null,
    source: r.source,
    debitedPackId: r.debitedPackId,
    debitedPackName: r.debitedPack?.name ?? null,
    createdByName: formatUserDisplayName(r.createdByUser),
    createdByRole: r.createdByUser?.role ?? null,
    planning: {
      id: r.planning.id,
      courseSlug: r.planning.courseSlug,
      courseLabel: courseLabel(r.planning.courseSlug),
      startTime: r.planning.startTime,
      endTime: r.planning.endTime,
      level: r.planning.level,
      coachName: r.planning.coach
        ? `${r.planning.coach.firstName} ${r.planning.coach.lastName}`.trim()
        : null,
      coachImageUrl: r.planning.coach?.imageUrl ?? null,
    },
  };
}
