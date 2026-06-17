"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { useToast } from "@/components/ui/toast-provider";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";
import { Input } from "@/components/ui";

type RosterMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone?: string | null;
  qrPublicId?: string | null;
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
  level: string | null;
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
  level: string | null;
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
    level: string | null;
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
    level: string | null;
    coachName: string | null;
    coachImageUrl: string | null;
    capacity: number;
    waitlistCapacity: number | null;
    sessionDate: string; // YYYY-MM-DD
    dayLabel: string;
    opensAt: string; // HH:MM
  } | null;
};

function formatYmdDisplay(ymd: string | null | undefined): string {
  if (!ymd) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const [, year, month, day] = m;
  return `${day}-${month}-${year}`;
}

const statusLabels: Record<string, string> = {
  BOOKED: "Confirmée",
  WAITLIST: "Liste d'attente",
  ATTENDED: "Présente",
  CANCELLED: "Annulée",
};

/** Hauteur et typo alignées : Rechercher, Réinitialiser, Présence / Présent */
const presenceBtnBase =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3.5 text-xs font-semibold leading-none transition";

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

function isBeforePresenceOpens(nowTime: string | undefined, opensAt: string | undefined) {
  if (!nowTime || !opensAt) return false;
  return nowTime < opensAt;
}

/** Correspondance stricte nom (+ téléphone optionnel) parmi les résultats API. */
function findExactMemberInResults(
  items: { id: string; name: string; phone: string | null }[],
  nameFilter: string,
  phoneFilter: string,
): { id: string; name: string; phone: string | null } | null {
  const nameQ = nameFilter.trim().toLowerCase();
  const phoneQ = phoneFilter.trim();
  if (!nameQ && !phoneQ) return null;

  if (phoneQ) {
    const byBoth = items.filter(
      (i) => i.name.trim().toLowerCase() === nameQ && (i.phone ?? "").trim() === phoneQ,
    );
    if (byBoth.length === 1) return byBoth[0]!;
  }

  if (nameQ) {
    const byName = items.filter((i) => i.name.trim().toLowerCase() === nameQ);
    if (byName.length === 1) return byName[0]!;
  }

  return null;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className ?? "h-4 w-4"} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.5a1 1 0 0 1-1.444-.02L3.29 9.835a1 1 0 1 1 1.42-1.408l3.776 3.865 6.53-6.757a1 1 0 0 1 1.438.015Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PresenceMarkButton({
  isPresent,
  canMark,
  loading,
  markingLocked,
  opensAt,
  onMark,
}: {
  isPresent: boolean;
  canMark: boolean;
  loading: boolean;
  markingLocked: boolean;
  opensAt?: string;
  onMark: () => void;
}) {
  if (isPresent) {
    return (
      <span
        className={`${presenceBtnBase} gap-1.5 border border-emerald-600 bg-emerald-50 text-emerald-800`}
        role="status"
        aria-label="Présente"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckIcon className="h-3 w-3" />
        </span>
        Présente
      </span>
    );
  }

  const disabled = !canMark || loading;
  const title = markingLocked
    ? `Présence à partir de ${opensAt ?? "—"}`
    : canMark
      ? "Marquer la présence"
      : "Présence non disponible";

  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={() => {
        if (!disabled) onMark();
      }}
      className={`${presenceBtnBase} ${
        disabled
          ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-brand-dark/40"
          : "border border-brand-dark bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-[0.98]"
      }`}
    >
      {loading ? "Enregistrement…" : "Présence"}
    </button>
  );
}

export function PresenceRosterClient({ initialQrPublicId }: { initialQrPublicId: string }) {
  const { toast } = useToast();
  const [qrPublicId, setQrPublicId] = useState(initialQrPublicId);
  const [memberNameFilter, setMemberNameFilter] = useState("");
  const [memberPhoneFilter, setMemberPhoneFilter] = useState("");
  const [manualMemberId, setManualMemberId] = useState<string>("");
  /** Membre choisi dans la liste (bloque les suggestions tant que les champs correspondent). */
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    phone: string | null;
  } | null>(null);
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
      const scanned = data.scannedMember;
      const scannedName = `${scanned?.firstName ?? ""} ${scanned?.lastName ?? ""}`.trim();
      if (scanned && scannedName) {
        setSelectedMember({ id: scanned.id, name: scannedName, phone: scanned.phone ?? null });
        setManualMemberId(scanned.id);
        setMemberNameFilter(scannedName);
        setMemberPhoneFilter(scanned.phone?.trim() ?? "");
        setSuggestions([]);
      }
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

  const applyMemberSelection = useCallback(
    async (member: { id: string; name: string; phone: string | null }) => {
      setSelectedMember(member);
      setManualMemberId(member.id);
      setMemberNameFilter(member.name);
      setMemberPhoneFilter(member.phone ?? "");
      setSuggestions([]);
      await fetchRosterByMember(member.id);
    },
    [fetchRosterByMember],
  );

  const clearMemberSelection = useCallback(() => {
    setSelectedMember(null);
    setManualMemberId("");
    setSuggestions([]);
  }, []);

  const resetPresenceView = useCallback(async () => {
    setMemberNameFilter("");
    setMemberPhoneFilter("");
    setQrPublicId("");
    clearMemberSelection();
    setError(null);
    setRoster(null);
    await fetchRosterCurrentSlot();
  }, [clearMemberSelection, fetchRosterCurrentSlot]);

  const inputsMatchSelectedMember = useCallback(() => {
    if (!selectedMember) return false;
    const nameOk = memberNameFilter.trim() === selectedMember.name.trim();
    const phoneOk = memberPhoneFilter.trim() === (selectedMember.phone ?? "").trim();
    return nameOk && phoneOk;
  }, [memberNameFilter, memberPhoneFilter, selectedMember]);

  const runManualSearch = useCallback(async () => {
    if (qrPublicId.trim()) return;
    if (manualMemberId && selectedMember && inputsMatchSelectedMember()) {
      setSuggestions([]);
      return;
    }
    const q = `${memberNameFilter} ${memberPhoneFilter}`.trim();
    if (q.length < 2) {
      setSuggestions([]);
      clearMemberSelection();
      return;
    }
    if (manualMemberId && selectedMember && !inputsMatchSelectedMember()) {
      clearMemberSelection();
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

      const exact = findExactMemberInResults(items, memberNameFilter, memberPhoneFilter);
      if (exact) {
        await applyMemberSelection(exact);
        return;
      }

      if (items.length === 1) {
        await applyMemberSelection(items[0]!);
        return;
      }

      setSuggestions(items.length > 1 ? items : []);
    } catch {
      setSuggestions([]);
    }
  }, [
    applyMemberSelection,
    clearMemberSelection,
    inputsMatchSelectedMember,
    manualMemberId,
    memberNameFilter,
    memberPhoneFilter,
    qrPublicId,
    selectedMember,
  ]);

  useEffect(() => {
    const id = initialQrPublicId.trim();
    setQrPublicId(id);
    if (!id) {
      // Navigation vers /dashboard/presence sans QR:
      // on repart d'un état manuel propre (pas de membre "hérité" du scan précédent).
      setMemberNameFilter("");
      setMemberPhoneFilter("");
      setSelectedMember(null);
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

  const presenceSlotUi = useMemo(() => {
    const upcoming = roster?.upcomingClass ?? roster?.nextUpcomingClass ?? null;
    const mode: "active" | "upcoming" = roster?.class ? "active" : "upcoming";
    const presenceOpensAt =
      mode === "active" && roster?.class
        ? minus15(roster.class.startTime)
        : upcoming?.opensAt;
    const markingLocked = isBeforePresenceOpens(roster?.nowTime, presenceOpensAt);
    return { upcoming, mode, presenceOpensAt, markingLocked };
  }, [roster]);

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
            title: "Trop tôt",
            description: opensAt
              ? `Revenez à partir de ${opensAt} (15 min avant ${start}).`
              : "Revenez 15 minutes avant le début du cours.",
          });
          return;
        }
        throw new Error(message);
      }
      toast({
        variant: "success",
        title: data.alreadyMarked ? "Déjà marqué" : "Présence enregistrée",
        description: data.alreadyMarked
          ? "Ce membre était déjà marqué présent pour ce créneau."
          : "Check-in enregistré et réservation mise à jour.",
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
        title="Présence aux cours"
        description="Après scan du QR membre et validation avec la clé staff, la liste des inscrits du créneau s'affiche ici."
        showRoleLine={false}
      />

      <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] md:items-end">
          <Input
            id="presence-filter-name"
            label="Recherche par nom"
            value={memberNameFilter}
            onChange={(e) => {
              setMemberNameFilter(e.target.value);
              if (selectedMember && e.target.value.trim() !== selectedMember.name.trim()) {
                clearMemberSelection();
                setRoster(null);
              }
            }}
            placeholder="Ex: dupont"
          />
          <Input
            id="presence-filter-phone"
            label="Recherche par numéro"
            value={memberPhoneFilter}
            onChange={(e) => {
              setMemberPhoneFilter(e.target.value);
              if (
                selectedMember &&
                e.target.value.trim() !== (selectedMember.phone ?? "").trim()
              ) {
                clearMemberSelection();
                setRoster(null);
              }
            }}
            placeholder="Ex: 5522..."
          />
          <div className="flex h-9 items-center gap-2">
            <button
              type="button"
              onClick={() => void runManualSearch()}
              className={`${presenceBtnBase} border border-brand-medium/35 bg-brand-dark text-white hover:opacity-90`}
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => void resetPresenceView()}
              className={`${presenceBtnBase} border border-brand-medium/35 bg-white text-brand-dark hover:bg-zinc-50`}
            >
              Réinitialiser
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-brand-dark/60">
          {selectedMember && inputsMatchSelectedMember()
            ? "Membre sélectionné. Modifiez les champs ou cliquez sur Réinitialiser pour une nouvelle recherche."
            : "Saisissez au moins 2 caractères : les suggestions apparaissent pendant la saisie."}
        </p>

        {selectedMember && inputsMatchSelectedMember() ? (
          <p className="mt-2 text-sm font-medium text-brand-dark">
            Adhérent : <span className="font-semibold">{selectedMember.name}</span>
            {selectedMember.phone ? (
              <span className="text-brand-dark/70"> · {selectedMember.phone}</span>
            ) : null}
          </p>
        ) : null}

        {!qrPublicId.trim() && !manualMemberId && suggestions.length > 0 ? (
          <div className="mt-3 rounded-xl border border-brand-medium/20 bg-white">
            <div className="px-4 py-2 text-xs font-semibold text-brand-dark/70">Membres trouvés</div>
            <ul className="divide-y divide-brand-medium/15">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => void applyMemberSelection(s)}
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
            <div className="space-y-1">
              <p className="leading-5">{roster.message}</p>
              {!roster.class && !roster.upcomingClass && !roster.nextUpcomingClass && roster.sessionDate ? (
                <p className="text-xs font-medium text-amber-900/85">
                  Date : <span className="font-semibold">{formatYmdDisplay(roster.sessionDate)}</span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {(roster?.class || roster?.upcomingClass || roster?.nextUpcomingClass) ? (
          <div className="mt-8 space-y-6">
            {roster?.scannedMember && roster.message ? (
              <p className="text-sm font-medium text-brand-dark">
                Membre :{" "}
                <span className="font-semibold">
                  {`${roster.scannedMember.firstName ?? ""} ${roster.scannedMember.lastName ?? ""}`.trim() ||
                    "—"}
                </span>
                {roster.scannedMember.phone ? (
                  <span className="text-brand-dark/70"> · {roster.scannedMember.phone}</span>
                ) : null}
              </p>
            ) : null}
            <section className="rounded-xl border border-brand-medium/20 bg-zinc-50/50 p-4">
              {(() => {
                const { upcoming, mode, presenceOpensAt, markingLocked } = presenceSlotUi;
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
                        courseLabel: upcoming!.courseLabel,
                        startTime: upcoming!.startTime,
                        endTime: upcoming!.endTime,
                        level: upcoming!.level,
                        coachName: upcoming!.coachName,
                        coachImageUrl: upcoming!.coachImageUrl,
                        capacity: upcoming!.capacity,
                        waitlistCapacity: upcoming!.waitlistCapacity,
                        dateLabel: `${upcoming!.dayLabel} (${upcoming!.sessionDate})`,
                        opensAt: upcoming!.opensAt,
                      };
                return (
                  <div className="flex flex-col gap-2">
                {mode === "upcoming" ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/60">
                    Prochain cours réservé
                  </p>
                ) : null}
                <h2 className="text-lg font-semibold text-brand-dark">
                  {card.courseLabel} — {card.startTime} - {card.endTime}
                </h2>
                <p className="text-xs font-medium text-brand-dark/70">Date : {card.dateLabel}</p>
                {mode === "active" ? (
                  <p className="text-xs text-brand-dark/70">
                    Fenêtre active :{" "}
                    <span className="font-semibold text-brand-dark">
                      {presenceOpensAt} → {card.endTime}
                    </span>
                  </p>
                ) : null}
                {mode === "upcoming" && markingLocked && card.opensAt ? (
                  <div className="rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-2 text-xs leading-relaxed text-sky-950">
                    Affichage informatif : la liste et le marquage de présence seront disponibles à partir de{" "}
                    <span className="font-semibold">{card.opensAt}</span> (15 min avant le début du cours).
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 text-xs text-brand-dark/70">
                  {card.level && planningLevelLabelFr(card.level) ? (
                    <span>
                      Niveau :{" "}
                      <span className="font-semibold text-brand-dark">{planningLevelLabelFr(card.level)}</span>
                    </span>
                  ) : null}
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
                    Coach : <span className="font-semibold text-brand-dark">{card.coachName ?? "—"}</span>
                  </p>
                </div>
                {mode === "upcoming" && card.opensAt && !markingLocked ? (
                  <p className="text-xs text-brand-dark/70">
                    Présence disponible à partir de <span className="font-semibold text-brand-dark">{card.opensAt}</span>.
                  </p>
                ) : null}
              </div>
                );
              })()}

              {roster?.class ? (
                roster.class.reservations.length === 0 ? (
                  <p className="mt-3 text-sm text-brand-dark/60">Aucun inscrit sur ce créneau.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-brand-medium/15 rounded-xl border border-brand-medium/15 bg-white">
                    {roster.class.reservations.map((row) => {
                      const isScannedMember = roster.scannedMember?.id === row.member.id;
                      const canMark =
                        !presenceSlotUi.markingLocked &&
                        (row.status === "BOOKED" || row.status === "WAITLIST");
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
                              {isScannedMember ? <span className="ml-2 text-xs font-semibold text-brand-dark/70">(scannée)</span> : null}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-brand-dark/70">
                              Statut : <span className="text-brand-dark">{statusLabels[row.status] ?? row.status}</span>
                            </p>
                            {!row.member.qrPublicId && row.status !== "ATTENDED" ? (
                              <p className="mt-0.5 text-xs text-amber-800">Aucun QR assigné — présence manuelle possible</p>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-end">
                            <PresenceMarkButton
                              isPresent={isPresent}
                              canMark={canMark}
                              loading={markingId === row.id}
                              markingLocked={presenceSlotUi.markingLocked}
                              opensAt={presenceSlotUi.presenceOpensAt}
                              onMark={() => void markPresent(row.id)}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : null}
            </section>

            {roster?.nextUpcomingClass && roster?.upcomingClass ? (
              <section className="rounded-xl border border-brand-medium/20 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/60">
                  Autre cours à venir
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-brand-dark">
                    {roster.nextUpcomingClass.courseLabel} — {roster.nextUpcomingClass.startTime} - {roster.nextUpcomingClass.endTime}
                  </h3>
                  <p className="text-xs font-medium text-brand-dark/70">
                    Date : {roster.nextUpcomingClass.dayLabel} ({roster.nextUpcomingClass.sessionDate})
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-brand-dark/70">
                    {roster.nextUpcomingClass.level && planningLevelLabelFr(roster.nextUpcomingClass.level) ? (
                      <span>
                        Niveau :{" "}
                        <span className="font-semibold text-brand-dark">
                          {planningLevelLabelFr(roster.nextUpcomingClass.level)}
                        </span>
                      </span>
                    ) : null}
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
                      Coach : <span className="font-semibold text-brand-dark">{roster.nextUpcomingClass.coachName ?? "—"}</span>
                    </p>
                  </div>
                  <p className="text-xs text-brand-dark/70">
                    Présence disponible à partir de <span className="font-semibold text-brand-dark">{roster.nextUpcomingClass.opensAt}</span>.
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
