import { create } from "zustand";
import type { MemberPlanningOccurrence, MemberPlanningWindow, MemberReservationItem } from "@/types/member/booking";

type MemberBookingState = {
  occurrences: MemberPlanningOccurrence[];
  myReservations: MemberReservationItem[];
  reservationHistory: MemberReservationItem[];
  planningRange: { from: string; to: string } | null;
  planningWindow: MemberPlanningWindow;
  eligibility: { mode: "mixed" | "single" | "unknown"; allowedCourseSlugs: string[] } | null;
  /** Charge planning (semaine en cours + semaine suivante) + réservations membre */
  loadAll: () => Promise<void>;
};

export const useMemberBookingStore = create<MemberBookingState>((set) => ({
  occurrences: [],
  myReservations: [],
  reservationHistory: [],
  planningRange: null,
  planningWindow: "WEEKLY",
  eligibility: null,
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
      throw new Error(d?.error ?? "Impossible de charger vos reservations.");
    }
    const oData = (await oRes.json()) as {
      occurrences: MemberPlanningOccurrence[];
      range?: { from: string; to: string };
      bookingWindow?: MemberPlanningWindow;
      eligibility?: { mode: "mixed" | "single" | "unknown"; allowedCourseSlugs: string[] };
    };
    const mData = (await mRes.json()) as { items: MemberReservationItem[]; history?: MemberReservationItem[] };
    set({
      occurrences: oData.occurrences,
      myReservations: mData.items,
      reservationHistory: mData.history ?? [],
      planningRange: oData.range ?? null,
      planningWindow: oData.bookingWindow ?? "WEEKLY",
      eligibility: oData.eligibility ?? null,
    });
  },
}));
