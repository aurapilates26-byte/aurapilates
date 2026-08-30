"use client";

import { DashboardStatCards } from "@/components/ui/dashboard-stat-cards";
import {
  StatExpiredIcon,
  StatFinishedIcon,
  StatPlayIcon,
  StatProlongedIcon,
  StatUsersIcon,
} from "@/components/ui/dashboard-stat-card-icons";
import type {
  MemberPackStateFilter,
  MemberPrimaryPackStateCounts,
} from "@/lib/member-primary-pack-state";

type MemberPackStateCardsProps = {
  counts: MemberPrimaryPackStateCounts;
  value: MemberPackStateFilter;
  onChange: (value: MemberPackStateFilter) => void;
};

export function MemberPackStateCards({ counts, value, onChange }: MemberPackStateCardsProps) {
  const items = [
    {
      id: "ALL",
      label: "Total",
      count: counts.total,
      icon: <StatUsersIcon />,
      activeClass: "border-brand-dark/40 bg-brand-dark/5 ring-2 ring-brand-dark/15",
      idleClass: "border-brand-medium/20 bg-white hover:bg-zinc-50",
    },
    {
      id: "consuming",
      label: "En cours",
      count: counts.consuming,
      icon: <StatPlayIcon />,
      activeClass: "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200",
      idleClass: "border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70",
    },
    {
      id: "expired",
      label: "Expiré",
      count: counts.expired,
      icon: <StatExpiredIcon />,
      activeClass: "border-red-300 bg-red-50 ring-2 ring-red-200",
      idleClass: "border-red-200/80 bg-red-50/40 hover:bg-red-50/70",
    },
    {
      id: "prolonged",
      label: "Prolongé",
      count: counts.prolonged,
      icon: <StatProlongedIcon />,
      activeClass: "border-amber-300 bg-amber-50 ring-2 ring-amber-200",
      idleClass: "border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70",
    },
    {
      id: "finished",
      label: "Terminé",
      count: counts.finished,
      icon: <StatFinishedIcon />,
      activeClass: "border-zinc-300 bg-zinc-100 ring-2 ring-zinc-200",
      idleClass: "border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100/80",
    },
  ];

  return (
    <DashboardStatCards
      items={items}
      activeId={value}
      onSelect={(id) => {
        if (id === value) {
          onChange("ALL");
          return;
        }
        onChange(id as MemberPackStateFilter);
      }}
    />
  );
}
