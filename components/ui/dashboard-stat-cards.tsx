"use client";

import type { ReactNode } from "react";

export type DashboardStatCardItem = {
  id: string;
  label: string;
  count: number;
  icon?: ReactNode;
  activeClass?: string;
  idleClass?: string;
};

type DashboardStatCardsProps = {
  items: DashboardStatCardItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  columnsClass?: string;
};

export function DashboardStatCards({
  items,
  activeId,
  onSelect,
  columnsClass = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
}: DashboardStatCardsProps) {
  const isSelectable = Boolean(onSelect);

  return (
    <div className={`grid gap-2 ${columnsClass}`}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const surfaceClass = isActive
          ? (item.activeClass ?? "border-brand-dark/40 bg-brand-dark/5 ring-2 ring-brand-dark/15")
          : (item.idleClass ?? "border-brand-medium/20 bg-white hover:bg-zinc-50");

        const content = (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/55">{item.label}</p>
              {item.icon ? (
                <span className="shrink-0 text-brand-dark/45" aria-hidden>
                  {item.icon}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-brand-dark">{item.count}</p>
          </>
        );

        if (isSelectable) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect!(item.id)}
              className={`rounded-xl border px-3 py-3 text-left transition ${surfaceClass}`}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={item.id} className={`rounded-xl border px-3 py-3 ${surfaceClass}`}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
