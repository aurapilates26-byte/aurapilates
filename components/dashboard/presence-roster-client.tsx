"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { useToast } from "@/components/ui/toast-provider";
import { Input, Switch } from "@/components/ui";

type RosterMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone?: string | null;
};

type RosterRow = {
  id: string;
  status: "BOOKED" | "WAITLIST" | "CANCELLED" | "ATTENDED";
  member: RosterMember;
};

type RosterClass = {
  planningId: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string;
  coachName: string | null;
  coachImageUrl?: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  scannedReservationId: string | null;
  scannedReservationStatus?: "BOOKED" | "WAITLIST" | "CANCELLED" | "ATTENDED";
  reservations: RosterRow[];
};

type CourseCardData = {
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string;
  coachName: string | null;
  coachImageUrl: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  dateLabel: string;
  opensAt?: string;
};

type RosterResponse = {
  scannedMember: RosterMember | null;
  sessionDate: string;
  nowTime?: string;
  message?: string | null;
  class: RosterClass | null;
  upcomingClass?: {
    planningId: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string;
    coachName: string | null;
    coachImageUrl: string | null;
    capacity: number;
    waitlistCapacity: number | null;
    sessionDate: string; // YYYY-MM-DD
    dayLabel: string;
    opensAt: string; // HH:MM
  } | null;
  nextUpcomingClass?: {
    planningId: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string;
    coachName: string | null;
    coachImageUrl: string | null;
    capacity: number;
    waitlistCapacity: number | null;
    sessionDate: string; // YYYY-MM-DD
    dayLabel: string;
    opensAt: string; // HH:MM
  } | null;
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

function minus15(clock: string) {
  const [hhRaw, mmRaw] = clock.split(":");
  const hh = Number(hhRaw ?? 0);
  const mm = Number(mmRaw ?? 0);
  const total = hh * 60 + mm - 15;
  const day = 24 * 60;
  const clamped = ((total % day) + day) % day;
  const outH = String(Math.floor(clamped / 60)).padStart(2, "0");
  const outM = String(clamped % 60).padStart(2, "0");
  return `${outH}:${outM}`;
}

export function PresenceRosterClient({ initialQrPublicId }: { initialQrPublicId: string }) {
  const { toast } = useToast();
  const [qrPublicId, setQrPublicId] = useState(initialQrPublicId);
  const [memberNameFilter, setMemberNameFilter] = useState("");
  const [memberPhoneFilter, setMemberPhoneFilter] = useState("");
  const [manualMemberId, setManualMemberId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const suggestTimer = useRef<number | null>(null);

  const fetchRosterCurrentSlot = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/presence/roster`, { cache: "no-store", credentials: "include" });
      const data = (await res.json().catch(() => null)) as RosterResponse & { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "Chargement impossible.");
      setRoster(data);
    } catch (e) {
      setRoster(null);
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRosterByQr = useCallback(async (id: string) => {
    if (!id) {
      await fetchRosterCurrentSlot();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/presence/roster?qrPublicId=${encodeURIComponent(id)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json().catch(() => null)) as RosterResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data?.error ?? "Chargement impossible.");
      }
      setRoster(data);
      const scannedName = `${data.scannedMember?.firstName ?? ""} ${data.scannedMember?.lastName ?? ""}`.trim();
      if (scannedName) setMemberNameFilter(scannedName);
      if (data.scannedMember?.phone?.trim()) setMemberPhoneFilter(data.scannedMember.phone.trim());
    } catch (e) {
      setRoster(null);
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }, [fetchRosterCurrentSlot]);

  const fetchRosterByMember = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/presence/roster?memberId=${encodeURIComponent(id)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json().catch(() => null)) as RosterResponse & { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "Chargement impossible.");
      setRoster(data);
    } catch (e) {
      setRoster(null);
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }, []);

  const runManualSearch = useCallback(async () => {
    if (qrPublicId.trim()) return;
    const q = `${memberNameFilter} ${memberPhoneFilter}`.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setManualMemberId("");
      return;
    }
    try {
      const res = await fetch(`/api/admin/presence/members?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json().catch(() => null)) as {
        items?: { id: string; name: string; phone: string | null }[];
        error?: string;
      };
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const items = Array.isArray(data?.items) ? data.items : [];

      // Un seul résultat: sélection immédiate + remplissage automatique des deux inputs.
      if (items.length === 1) {
        const only = items[0]!;
        setManualMemberId(only.id);
        setMemberNameFilter(only.name);
        setMemberPhoneFilter(only.phone ?? "");
        setSuggestions([]);
        await fetchRosterByMember(only.id);
        return;
      }

      setSuggestions(items);
    } catch {
      setSuggestions([]);
    }
  }, [fetchRosterByMember, memberNameFilter, memberPhoneFilter, qrPublicId]);

  useEffect(() => {
    const id = initialQrPublicId.trim();
    setQrPublicId(id);
    if (!id) {
      // Navigation vers /dashboard/presence sans QR:
      // on repart d'un état manuel propre (pas de membre "hérité" du scan précédent).
      setMemberNameFilter("");
      setMemberPhoneFilter("");
      setManualMemberId("");
      setSuggestions([]);
    }
    void fetchRosterByQr(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement initial depuis l'URL uniquement
  }, [initialQrPublicId, fetchRosterByQr]);

  // Suggestions en mode manuel: quand il n'y a pas de QR et qu'on tape un nom/tel, proposer des membres.
  useEffect(() => {
    if (qrPublicId.trim()) return;
    if (suggestTimer.current) window.clearTimeout(suggestTimer.current);
    suggestTimer.current = window.setTimeout(() => {
      void runManualSearch();
    }, 250);
    return () => {
      if (suggestTimer.current) window.clearTimeout(suggestTimer.current);
    };
  }, [memberNameFilter, memberPhoneFilter, qrPublicId, runManualSearch]);

  const filteredReservations = useMemo(() => {
    const rows = roster?.class?.reservations ?? [];
    const nameQ = memberNameFilter.trim().toLowerCase();
    const phoneQ = memberPhoneFilter.trim().toLowerCase();
    if (!nameQ && !phoneQ) return rows;
    return rows.filter((row) => {
      const fullName = `${row.member.firstName ?? ""} ${row.member.lastName ?? ""}`.trim().toLowerCase();
      const phone = (row.member.phone ?? "").toLowerCase();
      const byName = nameQ ? fullName.includes(nameQ) : true;
      const byPhone = phoneQ ? phone.includes(phoneQ) : true;
      return byName && byPhone;
    });
  }, [roster?.class?.reservations, memberNameFilter, memberPhoneFilter]);

  const presenceOpensAt = useCallback((startTime: string) => {
    const [hhRaw, mmRaw] = startTime.split(":");
    const hh = Number(hhRaw ?? 0);
    const mm = Number(mmRaw ?? 0);
    const total = hh * 60 + mm - 15;
    const clamped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    const outH = Math.floor(clamped / 60);
    const outM = clamped % 60;
    return `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`;
  }, []);

  const markPresent = async (reservationId: string) => {
    setMarkingId(reservationId);
    try {
      const res = await fetch("/api/admin/presence/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; alreadyMarked?: boolean };
      if (!res.ok) {
        const message = data?.error ?? "Action impossible.";
        if (message.toLowerCase().includes("15 minutes")) {
          const start = roster?.class?.startTime;
          const opensAt = start ? presenceOpensAt(start) : null;
          toast({
            variant: "warning",
            title: "Trop tot",
            description: opensAt
              ? `Revenez a partir de ${opensAt} (15 min avant ${start}).`
              : "Revenez 15 minutes avant le debut du cours.",
          });
          return;
        }
        throw new Error(message);
      }
      toast({
        variant: "success",
        title: data.alreadyMarked ? "Deja marque" : "Presence enregistree",
        description: data.alreadyMarked
          ? "Ce membre etait deja marque present pour ce creneau."
          : "Check-in enregistre et reservation mise a jour.",
      });
      if (qrPublicId.trim()) {
        await fetchRosterByQr(qrPublicId.trim());
      } else if (manualMemberId) {
        await fetchRosterByMember(manualMemberId);
      } else {
        await fetchRosterCurrentSlot();
      }
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
      });
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Presence aux cours"
        description="Apres scan du QR membre et validation avec la cle staff, la liste des inscrits du creneau s'affiche ici."
        showRoleLine={false}
      />

      <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] md:items-end">
          <Input
            id="presence-filter-name"
            label="Recherche par nom"
            value={memberNameFilter}
            onChange={(e) => setMemberNameFilter(e.target.value)}
            placeholder="Ex: dupont"
          />
          <Input
            id="presence-filter-phone"
            label="Recherche par numero"
            value={memberPhoneFilter}
            onChange={(e) => setMemberPhoneFilter(e.target.value)}
            placeholder="Ex: 5522..."
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void runManualSearch()}
              className="rounded-full border border-brand-medium/35 bg-brand-dark px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => {
                setMemberNameFilter("");
                setMemberPhoneFilter("");
                setManualMemberId("");
                setSuggestions([]);
              }}
              className="rounded-full border border-brand-medium/35 bg-white px-5 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
            >
              Reinitialiser
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-brand-dark/60">Le filtre s'applique automatiquement pendant la saisie.</p>

        {!qrPublicId.trim() && suggestions.length > 1 ? (
          <div className="mt-3 rounded-xl border border-brand-medium/20 bg-white">
            <div className="px-4 py-2 text-xs font-semibold text-brand-dark/70">Membres trouves</div>
            <ul className="divide-y divide-brand-medium/15">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setManualMemberId(s.id);
                      // Sélection manuelle explicite: on remplit nom + téléphone automatiquement.
                      setMemberNameFilter(s.name);
                      setMemberPhoneFilter(s.phone ?? "");
                      setSuggestions([]);
                      void fetchRosterByMember(s.id);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-brand-dark transition hover:bg-zinc-50"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-brand-dark/60">{s.phone ?? "—"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {roster?.message ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a1.2 1.2 0 110 2.4A1.2 1.2 0 0112 16zm1-3.5a1 1 0 11-2 0V7a1 1 0 112 0v5.5z" />
              </svg>
            </span>
            <p className="leading-5">{roster.message}</p>
          </div>
        ) : null}

        {(roster?.class || roster?.upcomingClass) ? (
          <div className="mt-8 space-y-6">
            <section className="rounded-xl border border-brand-medium/20 bg-zinc-50/50 p-4">
              {(() => {
                const mode: "active" | "upcoming" = roster?.class ? "active" : "upcoming";
                const card: CourseCardData =
                  mode === "active"
                    ? {
                        courseLabel: roster!.class!.courseLabel,
                        startTime: roster!.class!.startTime,
                        endTime: roster!.class!.endTime,
                        level: roster!.class!.level,
                        coachName: roster!.class!.coachName,
                        coachImageUrl: roster!.class!.coachImageUrl ?? null,
                        capacity: roster!.class!.capacity,
                        waitlistCapacity: roster!.class!.waitlistCapacity,
                        dateLabel: roster!.sessionDate,
                      }
                    : {
                        courseLabel: roster!.upcomingClass!.courseLabel,
                        startTime: roster!.upcomingClass!.startTime,
                        endTime: roster!.upcomingClass!.endTime,
                        level: roster!.upcomingClass!.level,
                        coachName: roster!.upcomingClass!.coachName,
                        coachImageUrl: roster!.upcomingClass!.coachImageUrl,
                        capacity: roster!.upcomingClass!.capacity,
                        waitlistCapacity: roster!.upcomingClass!.waitlistCapacity,
                        dateLabel: `${roster!.upcomingClass!.dayLabel} (${roster!.upcomingClass!.sessionDate})`,
                        opensAt: roster!.upcomingClass!.opensAt,
                      };
                return (
                  <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-brand-dark">
                  {card.courseLabel} — {card.startTime} - {card.endTime}
                </h2>
                <p className="text-xs font-medium text-brand-dark/70">Date: {card.dateLabel}</p>
                {mode === "active" ? (
                  <p className="text-xs text-brand-dark/70">
                    Fenetre active:{" "}
                    <span className="font-semibold text-brand-dark">
                      {minus15(card.startTime)} → {card.endTime}
                    </span>
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 text-xs text-brand-dark/70">
                  <span>
                    Niveau: <span className="font-semibold text-brand-dark">{levelLabels[card.level] ?? card.level}</span>
                  </span>
                  <span>
                    Places: <span className="font-semibold text-brand-dark">{card.capacity}</span>
                  </span>
                  <span>
                    Attente max: <span className="font-semibold text-brand-dark">{card.waitlistCapacity ?? "—"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
                    {card.coachImageUrl ? (
                      <img src={card.coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">—</div>
                    )}
                  </div>
                  <p className="text-xs text-brand-dark/70">
                    Coach: <span className="font-semibold text-brand-dark">{card.coachName ?? "—"}</span>
                  </p>
                </div>
                {mode === "upcoming" && card.opensAt ? (
                  <p className="text-xs text-brand-dark/70">
                    Presence disponible a partir de <span className="font-semibold text-brand-dark">{card.opensAt}</span>.
                  </p>
                ) : null}
              </div>
                );
              })()}

              {roster?.class ? (
                filteredReservations.length === 0 ? (
                  <p className="mt-3 text-sm text-brand-dark/60">Aucun inscrit sur ce creneau.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-brand-medium/15 rounded-xl border border-brand-medium/15 bg-white">
                    {filteredReservations.map((row) => {
                      const isScannedMember = roster.scannedMember?.id === row.member.id;
                      const canMark = row.status === "BOOKED" || row.status === "WAITLIST";
                      const isPresent = row.status === "ATTENDED";

                      return (
                        <li
                          key={row.id}
                          className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                            isScannedMember ? "bg-brand-light/25" : ""
                          }`}
                        >
                          <div className="w-full">
                            <p className="font-medium text-brand-dark">
                              {`${row.member.firstName ?? ""} ${row.member.lastName ?? ""}`.trim() || "Membre"}
                              {isScannedMember ? <span className="ml-2 text-xs font-semibold text-brand-dark/70">(scanne)</span> : null}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-brand-dark/70">
                              Statut: <span className="text-brand-dark">{statusLabels[row.status] ?? row.status}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-end">
                            <Switch
                              checked={isPresent}
                              disabled={!canMark || markingId === row.id || isPresent}
                              ariaLabel="Marquer present"
                              onCheckedChange={(next) => {
                                if (!next) return;
                                void markPresent(row.id);
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : null}
            </section>

            {roster?.nextUpcomingClass ? (
              <section className="rounded-xl border border-brand-medium/20 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/60">
                  Prochain cours du membre
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-brand-dark">
                    {roster.nextUpcomingClass.courseLabel} — {roster.nextUpcomingClass.startTime} - {roster.nextUpcomingClass.endTime}
                  </h3>
                  <p className="text-xs font-medium text-brand-dark/70">
                    Date: {roster.nextUpcomingClass.dayLabel} ({roster.nextUpcomingClass.sessionDate})
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-dark/70">
                    <span>
                      Niveau:{" "}
                      <span className="font-semibold text-brand-dark">
                        {levelLabels[roster.nextUpcomingClass.level] ?? roster.nextUpcomingClass.level}
                      </span>
                    </span>
                    <span>
                      Places: <span className="font-semibold text-brand-dark">{roster.nextUpcomingClass.capacity}</span>
                    </span>
                    <span>
                      Attente max:{" "}
                      <span className="font-semibold text-brand-dark">{roster.nextUpcomingClass.waitlistCapacity ?? "—"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
                      {roster.nextUpcomingClass.coachImageUrl ? (
                        <img src={roster.nextUpcomingClass.coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">—</div>
                      )}
                    </div>
                    <p className="text-xs text-brand-dark/70">
                      Coach: <span className="font-semibold text-brand-dark">{roster.nextUpcomingClass.coachName ?? "—"}</span>
                    </p>
                  </div>
                  <p className="text-xs text-brand-dark/70">
                    Presence disponible a partir de <span className="font-semibold text-brand-dark">{roster.nextUpcomingClass.opensAt}</span>.
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
