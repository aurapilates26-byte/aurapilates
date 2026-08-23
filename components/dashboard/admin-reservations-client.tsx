"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Input } from "@/components/ui";
import { badgeClasses } from "@/lib/badge-classes";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";
import { useToast } from "@/components/ui/toast-provider";
import { AddProspectDialog } from "@/components/dashboard/reservations/add-prospect-dialog";
import type { ProspectRow } from "@/components/dashboard/reservations/prospect-types";
import {
  buildConvertedProspectByMemberId,
  ConvertedProspectBadge,
  filterVisibleProspects,
  ProspectRowActions,
} from "@/components/dashboard/reservations/prospect-row-actions";
import { RecordProspectTrialPaymentDialog } from "@/components/dashboard/reservations/record-prospect-trial-payment-dialog";

type SlotRow = {
  planningId: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string;
  coachName: string | null;
  coachImageUrl?: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  stats: {
    booked: number;
    attended: number;
    waitlist: number;
    cancelled: number;
    prospects: number;
    spotsRemaining: number;
    waitSpotsRemaining: number | null;
  };
};

type SlotsResponse = {
  date: string;
  dayOfWeek: string;
  slots: SlotRow[];
};

type RosterRow = {
  id: string;
  status: "BOOKED" | "WAITLIST" | "CANCELLED" | "ATTENDED";
  packRefundedAt: string | null;
  member: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    qrPublicId: string | null;
  };
  attendance: { markedAt: string; markedBy: string } | null;
};

type RosterResponse = {
  date: string;
  slot: {
    planningId: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string;
    coachName: string | null;
    capacity: number;
    waitlistCapacity: number | null;
  };
  reservations: RosterRow[];
  prospects: ProspectRow[];
};

type SearchItem = {
  date: string;
  planningId: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string;
  coachName: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  matchCount: number;
  sampleMembers: { name: string; phone: string | null }[];
};

type SearchResponse = {
  q: string;
  from: string;
  to: string;
  items: SearchItem[];
};

const statusLabels: Record<string, string> = {
  BOOKED: "Confirmée",
  WAITLIST: "Liste d'attente",
  ATTENDED: "Présente",
  CANCELLED: "Annulée",
};

function statusBadgeClass(status: RosterRow["status"]) {
  if (status === "BOOKED" || status === "ATTENDED") {
    return "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900";
  }
  if (status === "WAITLIST") {
    return "inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900";
  }
  return "inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-zinc-700";
}

const prospectStatusLabels: Record<string, string> = {
  ACTIVE: "Prospect",
  PAID_TRIAL: "Prospect",
  CONVERTED: "Convertie",
};

function prospectBadgeClass(_status: ProspectRow["status"]) {
  return "inline-flex rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-900";
}

/** Séance encaissée = la personne était présente à la séance d'essai. */
function prospectPresenceLabel(status: ProspectRow["status"]): string {
  if (status === "PAID_TRIAL") return "Oui";
  return "—";
}

function prospectPresenceClass(status: ProspectRow["status"]): string {
  if (status === "PAID_TRIAL") return "text-brand-dark/80";
  return "text-brand-dark/60";
}

function cancelledPackInfoLabel(r: RosterRow) {
  if (r.status !== "CANCELLED") return null;
  return r.packRefundedAt ? "Séance rendue au pack" : "Annulation tardive (non rendue)";
}

function matchesRosterFilter(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  phone: string | null | undefined,
  query: string,
) {
  if (!query) return true;
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim().toLowerCase();
  const phoneNorm = (phone ?? "").toLowerCase();
  return fullName.includes(query) || phoneNorm.includes(query);
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromYmd(ymd: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function labelForDay(ymd: string, offsetFromToday: number) {
  const d = fromYmd(ymd);
  if (!d) return ymd;
  const dateFr = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (offsetFromToday === 0) return `Aujourd'hui · ${dateFr}`;
  if (offsetFromToday === 1) return `Demain · ${dateFr}`;
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" }).replace(/^\p{L}/u, (c) => c.toUpperCase());
  return `${weekday} · ${dateFr}`;
}

function formatYmdDisplay(ymd: string) {
  const d = fromYmd(ymd);
  if (!d) return ymd;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function AdminReservationsClient() {
  const { toast } = useToast();
  const router = useRouter();
  const todayYmd = useMemo(() => toYmd(new Date()), []);

  const [date, setDate] = useState(todayYmd);
  const [time, setTime] = useState("");
  const [memberQuery, setMemberQuery] = useState("");

  const [weekSlots, setWeekSlots] = useState<SlotsResponse[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [rosterByKey, setRosterByKey] = useState<Record<string, RosterResponse | null>>({});
  const [rosterLoadingKey, setRosterLoadingKey] = useState<string | null>(null);

  const [addProspectTarget, setAddProspectTarget] = useState<{ planningId: string; dateYmd: string; courseLabel: string } | null>(null);
  const [addProspectSubmitting, setAddProspectSubmitting] = useState(false);
  const [trialPaymentProspect, setTrialPaymentProspect] = useState<ProspectRow | null>(null);
  const [trialPaymentSubmitting, setTrialPaymentSubmitting] = useState(false);

  const searchAbortRef = useRef<AbortController | null>(null);

  const loadWeekSlots = useCallback(async () => {
    setLoadingWeek(true);
    try {
      const today = new Date();
      const targets = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        d.setDate(d.getDate() + i);
        return toYmd(d);
      });

      const results = await Promise.all(
        targets.map(async (ymd) => {
          const res = await fetch(`/api/admin/reservations?date=${encodeURIComponent(ymd)}`, { cache: "no-store" });
          const data = (await res.json().catch(() => null)) as (SlotsResponse & { error?: string }) | null;
          if (!res.ok) throw new Error(data?.error ?? `Chargement impossible pour ${ymd}.`);
          return data as SlotsResponse;
        })
      );

      setWeekSlots(results);
    } catch (e) {
      toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
    } finally {
      setLoadingWeek(false);
    }
  }, [toast]);

  const timeFilter = useMemo(() => {
    const t = time.trim();
    if (!t) return null;
    return /^\d{2}:\d{2}$/.test(t) ? t : null;
  }, [time]);

  const shouldKeepSlot = useCallback((dayYmd: string, slot: SlotRow) => {
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const todayYmd = toYmd(now);
    if (timeFilter) {
      // "Heure" means: show the slot that contains this time (start <= time < end)
      return slot.startTime <= timeFilter && slot.endTime > timeFilter;
    }

    const threshold = dayYmd === todayYmd ? nowTime : null;
    if (!threshold) return true;
    // default (no time filter): keep only slots that are still in the future today
    return slot.endTime > threshold;
  }, [timeFilter]);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/admin/reservations?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as (SlotsResponse & { error?: string }) | null;
      if (!res.ok) throw new Error(data?.error ?? "Chargement impossible.");
      setSlots(data);
    } catch (e) {
      toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
    } finally {
      setLoadingSlots(false);
    }
  }, [date, toast]);

  const loadRoster = useCallback(
    async (planningId: string, targetDate: string) => {
      const key = `${targetDate}:${planningId}`;
      setRosterLoadingKey(key);
      try {
        const res = await fetch(
          `/api/admin/reservations/roster?planningId=${encodeURIComponent(planningId)}&date=${encodeURIComponent(targetDate)}`,
          { cache: "no-store" }
        );
        const data = (await res.json().catch(() => null)) as (RosterResponse & { error?: string }) | null;
        if (!res.ok) throw new Error(data?.error ?? "Chargement impossible.");
        setRosterByKey((prev) => ({ ...prev, [key]: data as RosterResponse }));
      } catch (e) {
        setRosterByKey((prev) => ({ ...prev, [key]: null }));
        toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
      } finally {
        setRosterLoadingKey(null);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!date) void loadWeekSlots();
  }, [date, loadWeekSlots]);

  useEffect(() => {
    if (!date) {
      setSlots(null);
      return;
    }
    void loadSlots();
  }, [date, loadSlots]);

  const resetFilters = useCallback(() => {
    setDate(todayYmd);
    setTime("");
    setMemberQuery("");
    setSlots(null);
    setExpandedKey(null);
    setSearchData(null);
  }, [todayYmd]);

  useEffect(() => {
    const q = memberQuery.trim();
    if (q.length < 2) {
      searchAbortRef.current?.abort();
      setSearchData(null);
      setLoadingSearch(false);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current?.abort();
    searchAbortRef.current = controller;

    setLoadingSearch(true);
    const run = async () => {
      try {
        const qp = new URLSearchParams();
        qp.set("q", q);
        if (date) qp.set("date", date);
        const res = await fetch(`/api/admin/reservations/search?${qp.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await res.json().catch(() => null)) as (SearchResponse & { error?: string }) | null;
        if (!res.ok) throw new Error(data?.error ?? "Recherche impossible.");
        setSearchData(data as SearchResponse);
      } catch (e) {
        if (controller.signal.aborted) return;
        toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
        setSearchData(null);
      } finally {
        if (!controller.signal.aborted) setLoadingSearch(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [date, memberQuery, toast]);

  const orderedWeekSlots = useMemo(
    () =>
      weekSlots.map((day) => ({
        ...day,
        slots: [...day.slots].filter((s) => shouldKeepSlot(day.date, s)).sort((a, b) => a.startTime.localeCompare(b.startTime)),
      })),
    [shouldKeepSlot, weekSlots]
  );

  const orderedSlots = useMemo(() => {
    const dayYmd = slots?.date ?? date;
    return [...(slots?.slots ?? [])].filter((s) => shouldKeepSlot(dayYmd, s)).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [date, shouldKeepSlot, slots?.date, slots?.slots]);

  const searchByKey = useMemo(() => {
    const m = new Map<string, SearchItem>();
    for (const it of searchData?.items ?? []) {
      m.set(`${it.date}:${it.planningId}`, it);
    }
    return m;
  }, [searchData?.items]);

  const rosterFilterQuery = useMemo(() => memberQuery.trim().toLowerCase(), [memberQuery]);

  const refreshSlotAndRoster = useCallback(
    async (planningId: string, targetDate: string) => {
      await loadSlots();
      await loadRoster(planningId, targetDate);
    },
    [loadRoster, loadSlots],
  );

  const handleConfirmAddProspect = useCallback(
    async (data: { firstName: string; lastName: string; phone: string }) => {
      if (!addProspectTarget) return;
      setAddProspectSubmitting(true);
      try {
        const res = await fetch("/api/admin/reservations/prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planningId: addProspectTarget.planningId,
            sessionDate: addProspectTarget.dateYmd,
            ...data,
          }),
        });
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        if (!res.ok) throw new Error(payload?.error ?? "Ajout impossible.");
        setAddProspectTarget(null);
        const key = `${addProspectTarget.dateYmd}:${addProspectTarget.planningId}`;
        setExpandedKey(key);
        await refreshSlotAndRoster(addProspectTarget.planningId, addProspectTarget.dateYmd);
        toast({ variant: "success", title: "Prospect ajouté", description: "La place a été réservée pour la séance d'essai." });
      } catch (e) {
        toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
      } finally {
        setAddProspectSubmitting(false);
      }
    },
    [addProspectTarget, refreshSlotAndRoster, toast],
  );

  const handleConfirmTrialPayment = useCallback(
    async (data: {
      packId: string;
      paymentMethod: string;
      personalDiscount?: { type: "PERCENT" | "AMOUNT"; value: number; reason?: string };
    }) => {
      if (!trialPaymentProspect) return;
      setTrialPaymentSubmitting(true);
      try {
        const res = await fetch(
          `/api/admin/reservations/prospects/${encodeURIComponent(trialPaymentProspect.id)}/trial-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          },
        );
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        if (!res.ok) throw new Error(payload?.error ?? "Encaissement impossible.");

        const targetKey = expandedKey;
        setTrialPaymentProspect(null);
        if (targetKey) {
          const [dateYmd, planningId] = targetKey.split(":");
          if (dateYmd && planningId) await refreshSlotAndRoster(planningId, dateYmd);
        }
        toast({
          variant: "success",
          title: "Séance encaissée",
          description: "Enregistrée en caisse sous « Prospect ».",
        });
      } catch (e) {
        toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
      } finally {
        setTrialPaymentSubmitting(false);
      }
    },
    [expandedKey, refreshSlotAndRoster, toast, trialPaymentProspect],
  );

  const openProspectConvert = useCallback(
    (p: ProspectRow) => {
      router.push(
        `/dashboard/adherents?prospectId=${encodeURIComponent(p.id)}&from=reservations`,
      );
    },
    [router],
  );
  const openProspectCollect = useCallback((p: ProspectRow) => setTrialPaymentProspect(p), []);

  function renderRosterAccordion(dateYmd: string, s: SlotRow) {
    const key = `${dateYmd}:${s.planningId}`;
    const expanded = expandedKey === key;
    const roster = rosterByKey[key];
    const convertedByMemberId = roster ? buildConvertedProspectByMemberId(roster.prospects ?? []) : new Map();
    const visibleProspects = roster
      ? filterVisibleProspects(roster.prospects ?? [], roster.reservations)
      : [];

    return (
      <div className="mt-2">
        {expanded ? (
          <div className="mt-1 rounded-2xl border border-brand-medium/20 bg-zinc-50/40 p-2 sm:p-4">
            {rosterLoadingKey === key ? (
              <p className="text-sm text-brand-dark/65">Chargement...</p>
            ) : !roster ? (
              <p className="text-sm text-brand-dark/65">Aucune réservation sur ce créneau.</p>
            ) : visibleProspects.length === 0 && roster.reservations.length === 0 ? (
              <p className="text-sm text-brand-dark/65">Aucune réservation sur ce créneau.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto overflow-y-hidden lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-medium/15 bg-white/60 text-xs font-semibold text-brand-dark/70">
                        <th className="px-4 py-3 text-left">Membre</th>
                        <th className="px-4 py-3 text-center">Téléphone</th>
                        <th className="px-4 py-3 text-center">Cours</th>
                        <th className="px-4 py-3 text-center">Statut</th>
                        <th className="px-4 py-3 text-center">Présence</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-medium/15 bg-white">
                      {roster.reservations
                        .filter((r) =>
                          matchesRosterFilter(r.member.firstName, r.member.lastName, r.member.phone, rosterFilterQuery),
                        )
                        .map((r) => (
                          <tr key={r.id}>
                            <td className="px-4 py-3 text-left font-medium text-brand-dark">
                              <div>{`${r.member.firstName ?? ""} ${r.member.lastName ?? ""}`.trim() || "—"}</div>
                              <div className="text-xs font-normal text-brand-dark/60">{r.member.email ?? "—"}</div>
                            </td>
                            <td className="px-4 py-3 text-center text-brand-dark/80">{r.member.phone ?? "—"}</td>
                            <td className="px-4 py-3 text-center text-brand-dark/70">{s.courseLabel}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={statusBadgeClass(r.status)}>{statusLabels[r.status] ?? r.status}</span>
                                {r.status === "CANCELLED" ? (
                                  <div className="text-[11px] font-medium text-brand-dark/65">{cancelledPackInfoLabel(r)}</div>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-brand-dark/80">
                              {r.attendance ? "Oui" : "Non"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {convertedByMemberId.has(r.member.id) ? <ConvertedProspectBadge /> : "—"}
                            </td>
                          </tr>
                        ))}
                      {visibleProspects
                        .filter((p) => matchesRosterFilter(p.firstName, p.lastName, p.phone, rosterFilterQuery))
                        .map((p) => (
                          <tr key={`prospect-${p.id}`} className="bg-violet-50/30">
                            <td className="px-4 py-3 text-left font-medium text-brand-dark">
                              {`${p.firstName} ${p.lastName}`.trim()}
                            </td>
                            <td className="px-4 py-3 text-center text-brand-dark/80">{p.phone}</td>
                            <td className="px-4 py-3 text-center text-brand-dark/70">{p.courseLabel}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={prospectBadgeClass(p.status)}>
                                {prospectStatusLabels[p.status] ?? p.status}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-center ${prospectPresenceClass(p.status)}`}>
                              {prospectPresenceLabel(p.status)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <ProspectRowActions
                                  prospect={p}
                                  onCollect={() => openProspectCollect(p)}
                                  onConvert={() => openProspectConvert(p)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="overflow-hidden rounded-xl bg-white lg:hidden">
                  {roster.reservations
                    .filter((r) =>
                      matchesRosterFilter(r.member.firstName, r.member.lastName, r.member.phone, rosterFilterQuery),
                    )
                    .map((r) => (
                      <article key={r.id} className="border-b border-brand-medium/10 p-2 last:border-b-0 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-dark">
                              {`${r.member.firstName ?? ""} ${r.member.lastName ?? ""}`.trim() || "—"}
                            </p>
                            <p className="mt-1 text-xs text-brand-dark/70">{r.member.email ?? "—"}</p>
                            <p className="mt-1 text-xs text-brand-dark/60">{r.member.phone ?? "—"}</p>
                            {r.status === "CANCELLED" ? (
                              <p className="mt-1 text-[11px] font-medium text-brand-dark/65">{cancelledPackInfoLabel(r)}</p>
                            ) : null}
                          </div>
                          <span className={`shrink-0 ${statusBadgeClass(r.status)}`}>
                            {statusLabels[r.status] ?? r.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-brand-dark/70">
                          Présence :{" "}
                          <span className="font-semibold text-brand-dark/80">
                            {r.attendance ? "Oui" : "Non"}
                          </span>
                        </p>
                        {convertedByMemberId.has(r.member.id) ? (
                          <div className="mt-2">
                            <ConvertedProspectBadge />
                          </div>
                        ) : null}
                      </article>
                    ))}
                  {visibleProspects
                    .filter((p) => matchesRosterFilter(p.firstName, p.lastName, p.phone, rosterFilterQuery))
                    .map((p) => (
                      <article key={`prospect-${p.id}`} className="border-b border-violet-100 bg-violet-50/40 p-2 last:border-b-0 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-dark">{`${p.firstName} ${p.lastName}`.trim()}</p>
                            <p className="mt-1 text-xs text-brand-dark/60">{p.phone}</p>
                            <p className="mt-1 text-xs text-brand-dark/70">{p.courseLabel}</p>
                          </div>
                          <span className={`shrink-0 ${prospectBadgeClass(p.status)}`}>
                            {prospectStatusLabels[p.status] ?? p.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-brand-dark/70">
                          Présence :{" "}
                          <span className={`font-semibold ${prospectPresenceClass(p.status)}`}>
                            {prospectPresenceLabel(p.status)}
                          </span>
                        </p>
                        <div className="mt-2">
                          <ProspectRowActions
                            prospect={p}
                            onCollect={() => openProspectCollect(p)}
                            onConvert={() => openProspectConvert(p)}
                          />
                        </div>
                      </article>
                    ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  function renderDaySection(title: string, dayYmd: string, daySlots: SlotRow[]) {
    const filteredSlots =
      searchData && memberQuery.trim().length >= 2
        ? daySlots.filter((s) => searchByKey.has(`${dayYmd}:${s.planningId}`))
        : daySlots;

    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-brand-dark/80">{title}</h3>

        {filteredSlots.length === 0 ? (
          <p className="text-sm text-brand-dark/65">
            {searchData && memberQuery.trim().length >= 2 ? "Aucun résultat pour cette date." : "Aucun créneau pour cette date."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredSlots.map((s) => (
              <article
                key={`${dayYmd}-${s.planningId}`}
                className={`cursor-pointer rounded-2xl border border-brand-medium/20 bg-white p-2 shadow-sm transition sm:p-4 ${
                  expandedKey === `${dayYmd}:${s.planningId}` ? "ring-2 ring-brand-medium/20" : "hover:bg-zinc-50/40"
                }`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  const key = `${dayYmd}:${s.planningId}`;
                  const isOpen = expandedKey === key;
                  setExpandedKey(isOpen ? null : key);
                  if (!isOpen && rosterByKey[key] === undefined) {
                    void loadRoster(s.planningId, dayYmd);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  const key = `${dayYmd}:${s.planningId}`;
                  const isOpen = expandedKey === key;
                  setExpandedKey(isOpen ? null : key);
                  if (!isOpen && rosterByKey[key] === undefined) {
                    void loadRoster(s.planningId, dayYmd);
                  }
                }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark sm:text-base">
                      {s.courseLabel}
                      <span className="font-semibold text-brand-dark/70">{` · ${s.startTime}-${s.endTime}`}</span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-dark/70 sm:text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:text-xs ${planningLevelBadgeClass(
                          s.level
                        )}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                          <path d="M12 3l2.47 5 5.53.8-4 3.9.95 5.5L12 15.9 7.05 18.2 8 12.7 4 8.8 9.53 8z" />
                        </svg>
                        Niveau : {planningLevelLabelFr(s.level)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-7 w-7 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
                          {s.coachImageUrl ? (
                            <img src={s.coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">—</span>
                          )}
                        </span>
                        <span>Coach : {s.coachName ?? "—"}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className={badgeClasses.availability}>
                      Places : {s.stats.booked + s.stats.attended + (s.stats.prospects ?? 0)}/{s.capacity} (libre :{" "}
                      {s.stats.spotsRemaining})
                    </span>
                    {s.waitlistCapacity != null ? (
                      <span className={badgeClasses.waitlist}>
                        Attente : {s.stats.waitlist}/{s.waitlistCapacity}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      disabled={s.stats.spotsRemaining <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (s.stats.spotsRemaining <= 0) {
                          toast({ variant: "error", title: "Complet", description: "Plus de place disponible sur ce créneau." });
                          return;
                        }
                        setAddProspectTarget({
                          planningId: s.planningId,
                          dateYmd: dayYmd,
                          courseLabel: s.courseLabel,
                        });
                      }}
                      className={`${badgeClasses.prospect} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      + Prospect
                    </button>
                  </div>
                </div>
                {renderRosterAccordion(dayYmd, s)}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Réservations"
        description="Filtrez par date ou heure et par membre pour suivre les réservations du jour, à venir ou passées."
        showRoleLine={false}
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_minmax(200px,1fr)_minmax(280px,1fr)_auto] lg:items-end lg:gap-4">
            <Input
              id="admin-res-date"
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Choisir une date"
            />
            <Input
              id="admin-res-time"
              label="Heure (optionnel)"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Input
              id="admin-res-member"
              label="Recherche membre (nom ou téléphone)"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Ex: dupont ou 55..."
            />
            <button
              type="button"
              onClick={() => resetFilters()}
              disabled={loadingWeek || loadingSlots}
              className="h-11 w-full rounded-full border border-brand-medium/30 bg-white px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60 sm:w-auto"
            >
              Réinitialiser
            </button>
          </div>

          <p className="mt-3 text-xs text-brand-dark/60">
            Les filtres s&apos;appliquent automatiquement à la saisie. Utilisez Réinitialiser pour revenir à l&apos;état par défaut.
          </p>

          {loadingSearch ? (
            <p className="mt-3 text-xs text-brand-dark/60">Recherche en cours...</p>
          ) : searchData && memberQuery.trim().length >= 2 ? (
            <p className="mt-3 text-xs text-brand-dark/60">
              Résultats : <span className="font-semibold">{searchData.items.length}</span> créneau(x) — période{" "}
              <span className="font-semibold">
                {formatYmdDisplay(searchData.from)} → {formatYmdDisplay(searchData.to)}
              </span>
            </p>
          ) : null}

          <div className="mt-6 border-t border-brand-medium/15 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-dark">
                {date
                  ? (date < todayYmd
                    ? `Historique des réservations · ${formatYmdDisplay(slots?.date ?? date)}`
                    : `Réservations du ${formatYmdDisplay(slots?.date ?? date)}`)
                  : searchData && memberQuery.trim().length >= 2
                    ? "Résultats de recherche (7 jours)"
                    : "Réservations des 7 prochains jours"}
              </h2>
              {date && date < todayYmd ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5a1 1 0 10-2 0v5.4l3.2 1.85a1 1 0 001-1.74L13 11.2V7z" />
                  </svg>
                  Historique
                </span>
              ) : null}
            </div>

            {date ? (
              loadingSlots ? (
                <p className="mt-3 text-sm text-brand-dark/65">Chargement...</p>
              ) : slots ? (
                <div className="mt-4 space-y-6">
                  {orderedSlots.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <p className="leading-5">Aucun cours disponible pour le moment.</p>
                    </div>
                  ) : null}
                  {renderDaySection(`Date · ${formatYmdDisplay(slots.date)}`, slots.date, orderedSlots)}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <p className="leading-5">Aucun cours disponible pour le moment.</p>
                </div>
              )
            ) : loadingWeek ? (
              <p className="mt-3 text-sm text-brand-dark/65">Chargement...</p>
            ) : (
              <div className="mt-4 space-y-6">
                {orderedWeekSlots.map((day, idx) => (
                  <div key={day.date}>{renderDaySection(labelForDay(day.date, idx), day.date, day.slots)}</div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <AddProspectDialog
        isOpen={addProspectTarget != null}
        courseLabel={addProspectTarget?.courseLabel ?? ""}
        isSubmitting={addProspectSubmitting}
        onClose={() => setAddProspectTarget(null)}
        onConfirm={handleConfirmAddProspect}
      />

      <RecordProspectTrialPaymentDialog
        prospect={trialPaymentProspect}
        isOpen={trialPaymentProspect != null}
        isSubmitting={trialPaymentSubmitting}
        onClose={() => setTrialPaymentProspect(null)}
        onConfirm={handleConfirmTrialPayment}
      />
    </>
  );
}

