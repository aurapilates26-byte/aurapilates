"use client";

import type { MouseEvent } from "react";
import type { ProspectRow } from "@/components/dashboard/reservations/prospect-types";

const textBtnBase =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 whitespace-nowrap";

function stopCardClick(e: MouseEvent) {
  e.stopPropagation();
}

function DollarIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 fill-current ${className}`} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.81 2.4-1.39 0-.73-.39-1.41-2.25-1.87-2.06-.53-3.41-1.16-3.41-2.85 0-1.61 1.19-2.85 2.83-3.12V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.39 0 .65.39 1.25 2.25 1.72 2.06.53 3.41 1.25 3.41 2.99 0 1.72-1.21 3.03-3.03 3.22z" />
    </svg>
  );
}

function AddIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 fill-current ${className}`} aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

export function ConvertedProspectBadge() {
  return (
    <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-900">
      Convertie
    </span>
  );
}

export function PaidTrialProspectBadge() {
  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
      Séance payée
    </span>
  );
}

export function CollectTrialPaymentButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        stopCardClick(e);
        onClick();
      }}
      className={`${textBtnBase} border-amber-200/90 bg-amber-50 text-amber-950 hover:bg-amber-100 focus-visible:ring-amber-200`}
    >
      <DollarIcon />
      Encaisser
    </button>
  );
}

export function ConvertProspectButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        stopCardClick(e);
        onClick();
      }}
      className={`${textBtnBase} border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100 focus-visible:ring-violet-200`}
    >
      <AddIcon />
      Convertir
    </button>
  );
}

export function ProspectRowActions({
  prospect,
  onCollect,
  onConvert,
}: {
  prospect: ProspectRow;
  onCollect: () => void;
  onConvert: () => void;
}) {
  if (prospect.status === "CONVERTED") {
    return <ConvertedProspectBadge />;
  }
  if (prospect.status === "PAID_TRIAL") {
    return <PaidTrialProspectBadge />;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <CollectTrialPaymentButton onClick={onCollect} />
      <ConvertProspectButton onClick={onConvert} />
    </div>
  );
}

export function buildConvertedProspectByMemberId(prospects: ProspectRow[]): Map<string, ProspectRow> {
  const map = new Map<string, ProspectRow>();
  for (const p of prospects) {
    if (p.status === "CONVERTED" && p.convertedMemberId) {
      map.set(p.convertedMemberId, p);
    }
  }
  return map;
}

/** Évite une 2e ligne prospect quand la fiche adhérente est déjà dans le roster. */
export function filterVisibleProspects(prospects: ProspectRow[], reservations: { member: { id: string } }[]): ProspectRow[] {
  const memberIds = new Set(reservations.map((r) => r.member.id));
  return prospects.filter((p) => {
    if (p.status === "CONVERTED" && p.convertedMemberId && memberIds.has(p.convertedMemberId)) {
      return false;
    }
    return true;
  });
}
