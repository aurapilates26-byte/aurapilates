export type MemberPlanningWindow = "WEEKLY" | "FIFTEEN_DAYS" | "ONE_MONTH";

export type MemberPlanningOccurrence = {
  planningId: string;
  sessionDate: string;
  courseSlug: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string;
  coachName: string | null;
  coachImageUrl: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  mainOccupied: number;
  waitlistCount: number;
  spotsRemaining: number;
  waitSpotsRemaining: number | null;
  myReservation: { id: string; status: string } | null;
};

export type MemberReservationItem = {
  id: string;
  status: string;
  sessionDate: string;
  reservedAt: string;
  packRefundedAt?: string | null;
  planning: {
    id: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string;
    coachName: string | null;
    coachImageUrl: string | null;
  };
};
