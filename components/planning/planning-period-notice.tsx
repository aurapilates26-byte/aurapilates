"use client";

import { memberPeriodBlockedMessageFr, publicPeriodNoticeFr } from "@/lib/planning-period-status";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";

type PlanningPeriodNoticeProps = {
  config: PlanningPeriodEnriched | null;
  variant: "member" | "public";
  className?: string;
};

export function PlanningPeriodNotice({ config, variant, className = "" }: PlanningPeriodNoticeProps) {
  if (!config) return null;

  const message =
    variant === "member" ? memberPeriodBlockedMessageFr(config) : publicPeriodNoticeFr(config);

  if (!message) return null;

  const tone =
    config.status === "expired"
      ? "border-brand-medium/25 bg-zinc-100/90 text-brand-dark/85"
      : config.status === "upcoming"
        ? "border-brand-medium/20 bg-brand-light/40 text-brand-dark/80"
        : "border-brand-medium/20 bg-brand-light/30 text-brand-dark/75";

  return (
    <p
      className={`rounded-xl border px-3 py-2.5 text-center text-sm leading-relaxed ${tone} ${className}`.trim()}
      role="status"
    >
      {message}
    </p>
  );
}
