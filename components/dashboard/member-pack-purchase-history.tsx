"use client";

import { useCallback, useEffect, useState } from "react";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { packCategoryMenuLabel } from "@/lib/pack-categories";
import type { PackPaymentDto } from "@/types/admin/pack-payment";

function formatPaidAtYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function paymentKindLabel(kind: PackPaymentDto["paymentKind"]): string {
  if (kind === "DEPOSIT") return "Acompte";
  if (kind === "BALANCE") return "Solde";
  return "Paiement complet";
}

function paymentKindBadgeClass(kind: PackPaymentDto["paymentKind"]): string {
  if (kind === "DEPOSIT") return "border-sky-200 bg-sky-50 text-sky-900";
  if (kind === "BALANCE") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  return "border-brand-medium/25 bg-zinc-50 text-brand-dark/80";
}

function sourceLabel(source: PackPaymentDto["source"]): string {
  return source === "AUTO" ? "Automatique" : "Manuel";
}

type MemberPackPurchaseHistoryProps = {
  memberId: string;
  reloadToken?: number;
  embedded?: boolean;
};

export function MemberPackPurchaseHistory({
  memberId,
  reloadToken = 0,
  embedded = false,
}: MemberPackPurchaseHistoryProps) {
  const [items, setItems] = useState<PackPaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/pack-payments`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Chargement impossible.");
      }
      const data = (await response.json()) as { items: PackPaymentDto[] };
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  const totalPaid = items.reduce((sum, item) => sum + item.amountDinars, 0);

  return (
    <section
      className={
        embedded
          ? "rounded-xl border border-brand-medium/15 bg-zinc-50/60 p-4"
          : "mt-5 rounded-xl border border-brand-medium/15 bg-zinc-50/40 p-4"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4
            className={
              embedded
                ? "text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50"
                : "text-sm font-semibold text-brand-dark"
            }
          >
            Historique d&apos;achat des packs
          </h4>
          {!embedded ? (
            <p className="mt-0.5 text-xs text-brand-dark/60">
              Tous les encaissements enregistrés pour cette adhérente.
            </p>
          ) : null}
        </div>
        {!isLoading && items.length > 0 ? (
          <span className="rounded-full border border-brand-medium/20 bg-white px-3 py-1 text-xs font-semibold text-brand-dark">
            {items.length} achat{items.length > 1 ? "s" : ""} · {totalPaid} DT
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-brand-dark/60">Chargement…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-brand-dark/60">Aucun achat de pack enregistré.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-brand-medium/15 bg-white px-4 py-3 text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-dark">{item.packName}</p>
                  <p className="mt-0.5 text-xs text-brand-dark/60">
                    {formatPaidAtYmd(item.paidAtYmd)}
                    {item.packCategory ? ` · ${packCategoryMenuLabel(item.packCategory)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold tabular-nums text-brand-dark">{item.amountDinars} DT</p>
                  {item.packSaleTotalDinars != null &&
                  (item.paymentKind === "DEPOSIT" || item.paymentKind === "BALANCE") ? (
                    <p className="mt-0.5 text-[11px] text-brand-dark/55">
                      sur {item.packSaleTotalDinars} DT
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${paymentKindBadgeClass(item.paymentKind)}`}
                >
                  {paymentKindLabel(item.paymentKind)}
                </span>
                <PaymentMethodBadge method={item.paymentMethod} fallback="Moyen non renseigné" />
                <span className="rounded-full border border-brand-medium/20 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-dark/70">
                  {sourceLabel(item.source)}
                </span>
                {item.promotionLabel ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-900">
                    {item.promotionLabel}
                  </span>
                ) : null}
                {item.personalDiscountDinars > 0 ? (
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-900">
                    Remise perso −{item.personalDiscountDinars} DT
                  </span>
                ) : null}
              </div>

              {item.listPriceDinars != null && item.listPriceDinars !== item.amountDinars ? (
                <p className="mt-2 text-xs text-brand-dark/55">
                  Prix catalogue : {item.listPriceDinars} DT
                </p>
              ) : null}
              {item.note ? (
                <p className="mt-1 text-xs text-brand-dark/55">{item.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
