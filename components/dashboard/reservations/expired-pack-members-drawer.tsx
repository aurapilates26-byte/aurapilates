"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input, Switch } from "@/components/ui";
import { RightDrawer } from "@/components/ui/right-drawer";
import { useToast } from "@/components/ui/toast-provider";
import { dispatchMemberOwnedPacksChanged, subscribeMemberOwnedPacksChanged } from "@/store/admin/member-owned-packs-store";

type ExpiredPackMemberPack = {
  enrollmentId: string;
  packName: string;
  consumedSessions: number;
  remainingSessions: number;
  totalSessions: number | null;
  packExpiresAt: string | null;
  courseQuotaRemaining: { courseLabel: string; remaining: number; total: number }[];
};

type ExpiredPackMember = {
  memberId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  packs: ExpiredPackMemberPack[];
};

function packKey(memberId: string, enrollmentId: string) {
  return `${memberId}:${enrollmentId}`;
}

function formatYmdDisplay(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function memberName(m: ExpiredPackMember): string {
  return `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || "Adhérente";
}

type ExpiredPackMembersDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ExpiredPackMembersDrawer({ isOpen, onClose }: ExpiredPackMembersDrawerProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ExpiredPackMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prolongedKeys, setProlongedKeys] = useState<Set<string>>(() => new Set());
  const [prolongingKey, setProlongingKey] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    return subscribeMemberOwnedPacksChanged(() => {
      setReloadToken((t) => t + 1);
      setProlongedKeys(new Set());
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setItems([]);
      setError(null);
      setLoading(false);
      setProlongedKeys(new Set());
      setProlongingKey(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const query = search.trim();
    if (query.length < 2) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    setLoading(true);
    setError(null);

    timerRef.current = window.setTimeout(() => {
      void fetch(`/api/admin/members/expired-with-sessions?search=${encodeURIComponent(query)}`, {
        cache: "no-store",
      })
        .then(async (res) => {
          const data = (await res.json().catch(() => null)) as {
            items?: ExpiredPackMember[];
            error?: string;
          } | null;
          if (!res.ok) throw new Error(data?.error ?? "Recherche impossible.");
          setItems(data?.items ?? []);
        })
        .catch((e) => {
          setItems([]);
          setError(e instanceof Error ? e.message : "Erreur.");
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [isOpen, search, reloadToken]);

  const handleProlongToggle = useCallback(
    async (memberId: string, pack: ExpiredPackMemberPack, next: boolean) => {
      const key = packKey(memberId, pack.enrollmentId);
      if (!next || prolongedKeys.has(key)) return;

      setProlongingKey(key);
      try {
        const res = await fetch(
          `/api/admin/members/${encodeURIComponent(memberId)}/owned-packs/${encodeURIComponent(pack.enrollmentId)}/prolong`,
          { method: "POST" },
        );
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          packExpiresAt?: string | null;
          error?: string;
        } | null;
        if (!res.ok) throw new Error(data?.error ?? "Prolongation impossible.");

        setProlongedKeys((prev) => new Set(prev).add(key));
        setItems((prev) =>
          prev
            .map((member) => {
              if (member.memberId !== memberId) return member;
              const packs = member.packs.filter((p) => p.enrollmentId !== pack.enrollmentId);
              return packs.length > 0 ? { ...member, packs } : null;
            })
            .filter((m): m is ExpiredPackMember => m != null),
        );

        toast({
          variant: "success",
          title: "Pack prolongé",
          description: `${pack.packName} — nouvelle fin ${formatYmdDisplay(data?.packExpiresAt ?? null)}.`,
        });
        dispatchMemberOwnedPacksChanged({ memberId });
      } catch (e) {
        toast({
          variant: "error",
          title: "Erreur",
          description: e instanceof Error ? e.message : "Prolongation impossible.",
        });
      } finally {
        setProlongingKey(null);
      }
    },
    [prolongedKeys, toast],
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Prolongation · séances restantes"
      description="Adhérentes dont le pack est expiré mais qui ont encore des séances à consommer."
    >
      <Input
        id="expired-pack-member-search"
        label="Rechercher une adhérente"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nom ou téléphone (min. 2 caractères)"
        autoFocus
      />

      <p className="mt-3 text-xs text-brand-dark/60">
        Activez le switch pour prolonger la validité du pack (séances restantes conservées).
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-brand-dark/65">Recherche…</p>
      ) : error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
      ) : search.trim().length < 2 ? (
        <p className="mt-6 text-sm text-brand-dark/65">Saisissez au moins 2 caractères pour lancer la recherche.</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-brand-dark/65">Aucune adhérente trouvée avec un pack expiré et des séances restantes.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((member) => (
            <li
              key={member.memberId}
              className="rounded-xl border border-brand-medium/15 bg-white p-4 text-sm shadow-sm"
            >
              <div className="min-w-0">
                <Link
                  href={`/dashboard/adherents/${member.memberId}`}
                  className="font-semibold text-brand-dark hover:underline"
                  onClick={onClose}
                >
                  {memberName(member)}
                </Link>
                {member.phone ? <p className="mt-0.5 text-xs text-brand-dark/65">{member.phone}</p> : null}
              </div>

              <div className="mt-3 space-y-2">
                {member.packs.map((pack) => {
                  const key = packKey(member.memberId, pack.enrollmentId);
                  const isProlonged = prolongedKeys.has(key);
                  const isProlonging = prolongingKey === key;

                  return (
                    <div
                      key={pack.enrollmentId}
                      className={`rounded-xl border px-3 py-3 transition-colors ${
                        isProlonged
                          ? "border-amber-200 bg-amber-50/60"
                          : "border-red-200 bg-red-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-brand-dark">{pack.packName}</p>
                          <p className="mt-1 text-xs text-brand-dark/75">
                            Fin : {formatYmdDisplay(pack.packExpiresAt)} ·{" "}
                            <span className="font-semibold text-brand-dark">
                              {pack.consumedSessions}
                              {pack.totalSessions != null ? ` / ${pack.totalSessions}` : ""} séance
                              {(pack.totalSessions ?? pack.consumedSessions) > 1 ? "s" : ""}
                            </span>
                            {pack.remainingSessions > 0 ? (
                              <span className="text-brand-dark/65">
                                {" "}
                                · {pack.remainingSessions} restante{pack.remainingSessions > 1 ? "s" : ""}
                              </span>
                            ) : null}
                          </p>
                          {pack.courseQuotaRemaining.some((q) => q.remaining > 0) ? (
                            <p className="mt-1 text-[11px] text-brand-dark/65">
                              {pack.courseQuotaRemaining
                                .filter((q) => q.remaining > 0)
                                .map((q) => `${q.courseLabel} ${q.remaining}/${q.total}`)
                                .join(" · ")}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                              isProlonged
                                ? "border-amber-200 bg-amber-50 text-amber-900"
                                : "border-red-200 bg-red-50 text-red-800"
                            }`}
                          >
                            {isProlonged ? "Prolongé" : "Expiré"}
                          </span>
                          <Switch
                            checked={isProlonged}
                            disabled={isProlonged || isProlonging}
                            onCheckedChange={(next) => void handleProlongToggle(member.memberId, pack, next)}
                            ariaLabel={`Prolonger ${pack.packName}`}
                            label={isProlonging ? "…" : isProlonged ? "On" : "Off"}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </RightDrawer>
  );
}
