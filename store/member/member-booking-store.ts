import { create } from "zustand";
import type {
  MemberBookingRules,
  MemberPackSummary,
  MemberPlanningOccurrence,
  MemberPlanningPeriodMeta,
  MemberPlanningWindow,
  MemberReservationItem,
} from "@/types/member/booking";

type MemberBookingState = {
  occurrences: MemberPlanningOccurrence[];
  myReservations: MemberReservationItem[];
  reservationHistory: MemberReservationItem[];
  planningRange: { from: string; to: string } | null;
  planningWindow: MemberPlanningWindow;
  periodMeta: MemberPlanningPeriodMeta | null;
  eligibility: { mode: "mixed" | "single" | "unknown"; allowedCourseSlugs: string[] } | null;
  packSummary: MemberPackSummary | null;
  bookingRules: MemberBookingRules | null;
  /** Charge planning + réservations + solde pack (source unique). */
  loadAll: () => Promise<void>;
};

export const useMemberBookingStore = create<MemberBookingState>((set) => ({
  occurrences: [],
  myReservations: [],
  reservationHistory: [],
  planningRange: null,
  planningWindow: "WEEKLY",
  periodMeta: null,
  eligibility: null,
  packSummary: null,
  bookingRules: null,
  loadAll: async () => {
    const [oRes, mRes] = await Promise.all([
      fetch("/api/member/planning", { cache: "no-store" }),
      fetch("/api/member/reservations", { cache: "no-store" }),
    ]);
    if (!oRes.ok) {
      const d = (await oRes.json().catch(() => null)) as { error?: string };
      throw new Error(d?.error ?? "Impossible de charger le planning.");
    }
    if (!mRes.ok) {
      const d = (await mRes.json().catch(() => null)) as { error?: string };
      throw new Error(d?.error ?? "Impossible de charger vos réservations.");
    }
    const oData = (await oRes.json()) as {
      occurrences: MemberPlanningOccurrence[];
      range?: { from: string; to: string };
      bookingWindow?: MemberPlanningWindow;
      periodMeta?: MemberPlanningPeriodMeta;
      eligibility?: { mode: "mixed" | "single" | "unknown"; allowedCourseSlugs: string[] };
      bookingRules?: MemberBookingRules;
    };
    const mData = (await mRes.json()) as {
      items: MemberReservationItem[];
      history?: MemberReservationItem[];
      packSummary?: MemberPackSummary;
    };
    set({
      occurrences: oData.occurrences,
      myReservations: mData.items,
      reservationHistory: mData.history ?? [],
      planningRange: oData.range ?? null,
      planningWindow: oData.bookingWindow ?? "WEEKLY",
      periodMeta: oData.periodMeta ?? null,
      eligibility: oData.eligibility ?? null,
      packSummary: mData.packSummary ?? null,
      bookingRules: oData.bookingRules ?? null,
    });
  },
}));
