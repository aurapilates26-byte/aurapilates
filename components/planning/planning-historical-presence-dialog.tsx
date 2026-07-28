"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import type { AdminPlanningItem, PlanningPeriodConfig } from "@/types/admin/planning";
import { useMemberOwnedPacksStore } from "@/store/admin/member-owned-packs-store";

type MemberHit = {
  id: string;
  name: string;
  phone: string | null;
  packName: string | null;
};

type RosterItem = {
  reservationId: string;
  memberId: string;
  memberName: string;
  phone: string | null;
  markedAt: string;
};

type PlanningHistoricalPresenceDialogProps = {
  open: boolean;
  onClose: () => void;
  slot: AdminPlanningItem | null;
  sessionDateYmd: string | null;
  periodConfig: PlanningPeriodConfig | null;
  courseLabel: string;
};

export function PlanningHistoricalPresenceDialog({
  open,
  onClose,
  slot,
  sessionDateYmd,
  periodConfig,
  courseLabel,
}: PlanningHistoricalPresenceDialogProps) {
  const { toast } = useToast();
  const notifyPacksChanged = useMemberOwnedPacksStore((s) => s.notifyPacksChanged);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<MemberHit[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberHit | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    if (!slot || !sessionDateYmd) return;
    setLoadingRoster(true);
    try {
      const res = await fetch(
        `/api/admin/planning-historical-presence?planningId=${encodeURIComponent(slot.id)}&sessionDateYmd=${encodeURIComponent(sessionDateYmd)}`,
        { cache: "no-store", credentials: "include" },
      );
      const data = (await res.json()) as { items?: RosterItem[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible");
      setRoster(data.items ?? []);
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Chargement impossible",
      });
    } finally {
      setLoadingRoster(false);
    }
  }, [sessionDateYmd, slot, toast]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHits([]);
      setSelectedMember(null);
      setRoster([]);
      setSearchError(null);
      return;
    }
    void loadRoster();
  }, [open, loadRoster]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearchError(null);
      if (!selectedMember) return;
      return;
    }

    const t = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `/api/admin/presence/members?q=${encodeURIComponent(q)}&historical=1`,
          { cache: "no-store", credentials: "include" },
        );
        const data = (await res.json().catch(() => null)) as {
          items?: { id: string; name: string; phone: string | null }[];
          error?: string;
        } | null;
        if (!res.ok) {
          throw new Error(data?.error ?? "Recherche impossible");
        }

        const items: MemberHit[] = (data?.items ?? []).map((m) => ({
          id: m.id,
          name: m.name,
          phone: m.phone,
          packName: null,
        }));

        setHits(items);

        if (items.length === 1) {
          setSelectedMember(items[0]!);
        }
      } catch (e) {
        setHits([]);
        setSearchError(e instanceof Error ? e.message : "Recherche impossible");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(t);
  }, [query]);

  const markPresent = async (member: MemberHit) => {
    if (!slot || !sessionDateYmd) {
      toast({ variant: "error", title: "Erreur", description: "Créneau ou date manquant." });
      return;
    }
    if (!periodConfig) {
      toast({
        variant: "error",
        title: "Période manquante",
        description: "Sélectionnez une période passée avant de marquer une présence.",
      });
      return;
    }

    setMarking(true);
    try {
      const res = await fetch("/api/admin/planning-historical-presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          memberId: member.id,
          planningId: slot.id,
          sessionDateYmd,
          periodConfig,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        items?: RosterItem[];
        ownedPacks?: MemberOwnedPackDto[];
        result?: { alreadyMarked?: boolean; packStartAdjusted?: boolean; packStartedAtYmd?: string };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible");
      setRoster(data.items ?? []);
      if (data.ownedPacks) {
        notifyPacksChanged(member.id, data.ownedPacks);
      } else {
        notifyPacksChanged(member.id);
        void useMemberOwnedPacksStore.getState().loadPacks(member.id);
      }
      setQuery("");
      setHits([]);
      setSelectedMember(null);
      const dateLabel = sessionDateYmd.split("-").reverse().join("/");
      const packStartNote =
        data.result?.packStartAdjusted && data.result.packStartedAtYmd
          ? ` Pack démarré au ${data.result.packStartedAtYmd.split("-").reverse().join("/")}.`
          : "";
      toast({
        variant: "success",
        title: data.result?.alreadyMarked ? "Déjà présent" : "Présence enregistrée",
        description: `${member.name} · ${dateLabel} · 1 séance débitée du pack.${packStartNote}`,
      });
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Enregistrement impossible",
      });
    } finally {
      setMarking(false);
    }
  };

  const removePresence = async (item: RosterItem) => {
    setDeletingId(item.reservationId);
    try {
      const res = await fetch("/api/admin/planning-historical-presence", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reservationId: item.reservationId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        items?: RosterItem[];
        ownedPacks?: MemberOwnedPackDto[];
        result?: { packCredited?: boolean };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Suppression impossible");
      setRoster(data.items ?? []);
      if (data.ownedPacks) {
        notifyPacksChanged(item.memberId, data.ownedPacks);
      } else {
        notifyPacksChanged(item.memberId);
        void useMemberOwnedPacksStore.getState().loadPacks(item.memberId);
      }
      if (selectedMember?.id === item.memberId) {
        setSelectedMember(null);
      }
      toast({
        variant: "success",
        title: "Présence supprimée",
        description: data.result?.packCredited
          ? `${item.memberName} retirée · 1 séance recréditée au pack.`
          : `${item.memberName} retirée de la liste.`,
      });
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Suppression impossible",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const dateFr = sessionDateYmd ? sessionDateYmd.split("-").reverse().join("/") : "—";
  const alreadyInRoster = selectedMember ? roster.some((r) => r.memberId === selectedMember.id) : false;

  return (
    <Modal
      isOpen={open}
      title="Présences — saisie historique"
      description={
        slot
          ? `${courseLabel} · ${dateFr} · ${slot.startTime}–${slot.endTime}`
          : undefined
      }
      panelClassName="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-xs leading-relaxed text-brand-dark/65">
          La présence est enregistrée à la <strong>date du cours</strong> ({dateFr}), pas à
          aujourd&apos;hui. Une réservation <code className="text-[10px]">ATTENDED</code> est créée
          automatiquement et <strong>1 séance est débitée</strong> du pack de l&apos;adhérente.
        </p>

        <div>
          <label htmlFor="historical-member-search" className="text-xs font-semibold text-brand-dark/70">
            Rechercher une adhérente
          </label>
          <Input
            id="historical-member-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedMember(null);
            }}
            placeholder="Nom, prénom ou téléphone…"
            className="mt-1"
            autoComplete="off"
          />
          {searching ? <p className="mt-1 text-xs text-brand-dark/50">Recherche dans les adhérentes…</p> : null}
          {searchError ? <p className="mt-1 text-xs text-red-600">{searchError}</p> : null}
          {!searching && query.trim().length >= 2 && hits.length === 0 && !searchError ? (
            <p className="mt-1 text-xs text-brand-dark/55">Aucune adhérente trouvée pour « {query.trim()} ».</p>
          ) : null}

          {hits.length > 0 ? (
            <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-xl border border-brand-medium/15 p-1">
              {hits.map((m) => {
                const isSelected = selectedMember?.id === m.id;
                const isPresent = roster.some((r) => r.memberId === m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      disabled={marking || isPresent}
                      onClick={() => setSelectedMember(m)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isSelected ? "bg-brand-light/60 ring-1 ring-brand-medium/25" : "hover:bg-zinc-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block font-medium text-brand-dark">{m.name}</span>
                        {m.phone ? (
                          <span className="block text-xs text-brand-dark/55">{m.phone}</span>
                        ) : null}
                      </span>
                      {isPresent ? (
                        <span className="ml-2 shrink-0 text-xs font-medium text-emerald-700">Déjà présent</span>
                      ) : isSelected ? (
                        <span className="ml-2 shrink-0 text-xs font-medium text-brand-dark/70">Sélectionné</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {selectedMember && !alreadyInRoster ? (
            <div className="mt-3">
              <Button
                type="button"
                disabled={marking}
                onClick={() => void markPresent(selectedMember)}
              >
                {marking ? "Enregistrement…" : `Marquer présent — ${selectedMember.name}`}
              </Button>
            </div>
          ) : null}
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
            Présents enregistrés ({roster.length})
          </h4>
          {loadingRoster ? (
            <p className="mt-2 text-sm text-brand-dark/60">Chargement…</p>
          ) : roster.length === 0 ? (
            <p className="mt-2 text-sm text-brand-dark/60">Aucune présence pour ce créneau.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {roster.map((r) => (
                <li
                  key={r.reservationId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-brand-medium/15 bg-zinc-50/80 px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-brand-dark">{r.memberName}</span>
                    {r.phone ? <span className="text-brand-dark/55"> · {r.phone}</span> : null}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(deletingId) || marking}
                    onClick={() => void removePresence(r)}
                    aria-label={`Supprimer la présence de ${r.memberName}`}
                    title="Supprimer la présence"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === r.reservationId ? (
                      <span className="text-[10px] font-semibold">…</span>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-brand-medium/15 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-brand-medium/35 bg-white px-5 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
