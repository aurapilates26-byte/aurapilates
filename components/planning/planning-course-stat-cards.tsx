"use client";

import { useMemo } from "react";
import { DashboardStatCards } from "@/components/ui/dashboard-stat-cards";
import {
  StatCalendarIcon,
  StatCoachingIcon,
  StatDanceIcon,
  StatEmptySlotIcon,
  StatMatIcon,
  StatReformerIcon,
  StatYogaIcon,
} from "@/components/ui/dashboard-stat-card-icons";
import {
  planningCourseStatCardActiveClass,
  planningCourseStatCardIdleClass,
} from "@/lib/planning-course-card-tone";
import type { AdminPlanningItem } from "@/types/admin/planning";

export type PlanningCourseFilter = "ALL" | string;

const PLANNING_COURSE_OPTIONS = [
  { value: "pilates-reformer", label: "Pilates reformer" },
  { value: "mat-pilates", label: "Mat pilates" },
  { value: "yoga", label: "Yoga" },
  { value: "dance", label: "Danse" },
  { value: "coaching-prive", label: "Coaching privé" },
  { value: "sans-cours", label: "Sans cours" },
] as const;

function courseIcon(slug: string) {
  switch (slug) {
    case "pilates-reformer":
      return <StatReformerIcon />;
    case "mat-pilates":
      return <StatMatIcon />;
    case "yoga":
      return <StatYogaIcon />;
    case "dance":
      return <StatDanceIcon />;
    case "coaching-prive":
      return <StatCoachingIcon />;
    case "sans-cours":
      return <StatEmptySlotIcon />;
    default:
      return <StatCalendarIcon />;
  }
}

type PlanningCourseStatCardsProps = {
  items: AdminPlanningItem[];
  value: PlanningCourseFilter;
  onChange: (value: PlanningCourseFilter) => void;
};

export function PlanningCourseStatCards({ items, value, onChange }: PlanningCourseStatCardsProps) {
  const countsBySlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.courseSlug, (map.get(item.courseSlug) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const statItems = useMemo(() => {
    const total = items.length;
    const courseCards = PLANNING_COURSE_OPTIONS.map((option) => ({
      id: option.value,
      label: option.label,
      count: countsBySlug.get(option.value) ?? 0,
      icon: courseIcon(option.value),
      activeClass: planningCourseStatCardActiveClass(option.value),
      idleClass: planningCourseStatCardIdleClass(option.value),
    }));

    return [
      {
        id: "ALL",
        label: "Total séances",
        count: total,
        icon: <StatCalendarIcon />,
        activeClass: "border-brand-dark/40 bg-brand-dark/5 ring-2 ring-brand-dark/15",
        idleClass: "border-brand-medium/20 bg-white hover:bg-zinc-50",
      },
      ...courseCards,
    ];
  }, [countsBySlug, items.length]);

  return (
    <DashboardStatCards
      items={statItems}
      activeId={value}
      onSelect={(id) => {
        if (id === value) {
          onChange("ALL");
          return;
        }
        onChange(id);
      }}
      columnsClass="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
    />
  );
}
