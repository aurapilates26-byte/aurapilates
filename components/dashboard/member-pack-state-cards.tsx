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
import {
  planningCourseStatCardActiveClass,
  planningCourseStatCardIdleClass,
} from "@/lib/planning-course-card-tone";

const MEMBER_PACK_STATE_TONES = {
  consuming: "pilates-reformer",
  expired: "mat-pilates",
  prolonged: "yoga",
  finished: "dance",
} as const;

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
      idleClass: "border-brand-medium/20 bg-zinc-50",
    },
    {
      id: "consuming",
      label: "En cours",
      count: counts.consuming,
      icon: <StatPlayIcon />,
      activeClass: planningCourseStatCardActiveClass(MEMBER_PACK_STATE_TONES.consuming),
      idleClass: planningCourseStatCardIdleClass(MEMBER_PACK_STATE_TONES.consuming),
    },
    {
      id: "expired",
      label: "Expiré",
      count: counts.expired,
      icon: <StatExpiredIcon />,
      activeClass: planningCourseStatCardActiveClass(MEMBER_PACK_STATE_TONES.expired),
      idleClass: planningCourseStatCardIdleClass(MEMBER_PACK_STATE_TONES.expired),
    },
    {
      id: "prolonged",
      label: "Prolongé",
      count: counts.prolonged,
      icon: <StatProlongedIcon />,
      activeClass: planningCourseStatCardActiveClass(MEMBER_PACK_STATE_TONES.prolonged),
      idleClass: planningCourseStatCardIdleClass(MEMBER_PACK_STATE_TONES.prolonged),
    },
    {
      id: "finished",
      label: "Terminé",
      count: counts.finished,
      icon: <StatFinishedIcon />,
      activeClass: planningCourseStatCardActiveClass(MEMBER_PACK_STATE_TONES.finished),
      idleClass: planningCourseStatCardIdleClass(MEMBER_PACK_STATE_TONES.finished),
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
