"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Input } from "@/components/ui";
import { badgeClasses } from "@/lib/badge-classes";
import { useToast } from "@/components/ui/toast-provider";

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

const levelLabels: Record<string, string> = {
  ALL_LEVELS: "Tous niveaux",
  BEGINNER: "Debutant",
  INTERMEDIATE: "Intermediaire",
  ADVANCED: "Avance",
};

const statusLabels: Record<string, string> = {
  BOOKED: "Confirme",
  WAITLIST: "Liste d'attente",
  ATTENDED: "Present",
  CANCELLED: "Annule",
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

function cancelledPackInfoLabel(r: RosterRow) {
  if (r.status !== "CANCELLED") return null;
  return r.packRefundedAt ? "Seance rendue au pack" : "Annulation tardive (non rendue)";
}

function levelBadgeClass(level: string) {
  if (level === "BEGINNER") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (level === "INTERMEDIATE") return "border-sky-200 bg-sky-50 text-sky-900";
  if (level === "ADVANCED") return "border-violet-200 bg-violet-50 text-violet-900";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
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

export function AdminReservationsClient() {
  const { toast } = useToast();
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

  function renderRosterAccordion(dateYmd: string, s: SlotRow) {
    const key = `${dateYmd}:${s.planningId}`;
    const expanded = expandedKey === key;
    const roster = rosterByKey[key];

    return (
      <div className="mt-2">
        {expanded ? (
          <div className="mt-1 rounded-2xl border border-brand-medium/20 bg-zinc-50/40 p-2 sm:p-4">
            {rosterLoadingKey === key ? (
              <p className="text-sm text-brand-dark/65">Chargement...</p>
            ) : !roster ? (
              <p className="text-sm text-brand-dark/65">Aucune reservation sur ce creneau.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[920px] text-sm">
                    <thead>
                      <tr className="border-b border-brand-medium/15 bg-white/60 text-left text-xs font-semibold text-brand-dark/70">
                        <th className="px-4 py-3">Membre</th>
                        <th className="px-4 py-3">Telephone</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Presence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-medium/15 bg-white">
                      {roster.reservations
                        .filter((r) => {
                          if (!rosterFilterQuery) return true;
                          const fullName = `${r.member.firstName ?? ""} ${r.member.lastName ?? ""}`.trim().toLowerCase();
                          const phone = (r.member.phone ?? "").toLowerCase();
                          return fullName.includes(rosterFilterQuery) || phone.includes(rosterFilterQuery);
                        })
                        .map((r) => (
                          <tr key={r.id}>
                            <td className="px-4 py-3 font-medium text-brand-dark">
                              <div>{`${r.member.firstName ?? ""} ${r.member.lastName ?? ""}`.trim() || "—"}</div>
                              <div className="text-xs font-normal text-brand-dark/60">{r.member.email ?? "—"}</div>
                            </td>
                            <td className="px-4 py-3 text-brand-dark/80">{r.member.phone ?? "—"}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <span className={statusBadgeClass(r.status)}>{statusLabels[r.status] ?? r.status}</span>
                                {r.status === "CANCELLED" ? (
                                  <div className="text-[11px] font-medium text-brand-dark/65">{cancelledPackInfoLabel(r)}</div>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-brand-dark/80">
                              {r.attendance
                                ? `Oui (${new Date(r.attendance.markedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})`
                                : "Non"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="overflow-hidden rounded-xl bg-white lg:hidden">
                  {roster.reservations
                    .filter((r) => {
                      if (!rosterFilterQuery) return true;
                      const fullName = `${r.member.firstName ?? ""} ${r.member.lastName ?? ""}`.trim().toLowerCase();
                      const phone = (r.member.phone ?? "").toLowerCase();
                      return fullName.includes(rosterFilterQuery) || phone.includes(rosterFilterQuery);
                    })
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
                          Presence:{" "}
                          <span className="font-semibold text-brand-dark/80">
                            {r.attendance
                              ? `Oui (${new Date(r.attendance.markedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})`
                              : "Non"}
                          </span>
                        </p>
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
            {searchData && memberQuery.trim().length >= 2 ? "Aucun resultat pour cette date." : "Aucun creneau pour cette date."}
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
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:text-xs ${levelBadgeClass(
                          s.level
                        )}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                          <path d="M12 3l2.47 5 5.53.8-4 3.9.95 5.5L12 15.9 7.05 18.2 8 12.7 4 8.8 9.53 8z" />
                        </svg>
                        Niveau: {levelLabels[s.level] ?? s.level}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-7 w-7 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
                          {s.coachImageUrl ? (
                            <img src={s.coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">—</span>
                          )}
                        </span>
                        <span>Coach: {s.coachName ?? "—"}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className={badgeClasses.availability}>
                      Places: {s.stats.booked + s.stats.attended}/{s.capacity} (libre: {s.stats.spotsRemaining})
                    </span>
                    {s.waitlistCapacity != null ? (
                      <span className={badgeClasses.waitlist}>
                        Attente: {s.stats.waitlist}/{s.waitlistCapacity}
                      </span>
                    ) : null}
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
        title="Reservations"
        description="Filtrez par date/heure et membre pour suivre les reservations du jour, a venir, ou passees."
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
              label="Recherche membre (nom ou telephone)"
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
              Reinitialiser
            </button>
          </div>

          <p className="mt-3 text-xs text-brand-dark/60">
            Les filtres s'appliquent automatiquement a la saisie. Utilisez Reinitialiser pour revenir a l'etat par defaut.
          </p>

          {loadingSearch ? (
            <p className="mt-3 text-xs text-brand-dark/60">Recherche en cours...</p>
          ) : searchData && memberQuery.trim().length >= 2 ? (
            <p className="mt-3 text-xs text-brand-dark/60">
              Resultats: <span className="font-semibold">{searchData.items.length}</span> creneau(x) — periode{" "}
              <span className="font-semibold">
                {searchData.from} → {searchData.to}
              </span>
            </p>
          ) : null}

          <div className="mt-6 border-t border-brand-medium/15 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-dark">
                {date
                  ? (date < todayYmd ? `Historique des reservations · ${slots?.date ?? date}` : `Reservations du ${slots?.date ?? date}`)
                  : searchData && memberQuery.trim().length >= 2
                    ? "Resultats de recherche (7 jours)"
                    : "Reservations des 7 prochains jours"}
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
                <div className="mt-4 space-y-6">{renderDaySection(`Date · ${slots.date}`, slots.date, orderedSlots)}</div>
              ) : (
                <p className="mt-3 text-sm text-brand-dark/65">Aucun creneau pour cette date.</p>
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
    </>
  );
}

