"use client";

const badgeBase =
  "inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border px-3 py-1.5 text-xs font-medium leading-snug";

const toneClasses = {
  active: "border-brand-medium/25 bg-brand-light/80 text-brand-dark",
  expired: "border-red-200/80 bg-red-50/90 text-red-950",
  upcoming: "border-amber-200/70 bg-amber-50/80 text-amber-950",
  draft: "border-brand-medium/25 bg-brand-light/80 text-brand-dark",
} as const;

type PlanningPeriodSummaryBadgeProps = {
  statusLabel: string;
  periodLabel: string;
  metaLabel?: string;
  tone?: keyof typeof toneClasses;
  align?: "start" | "center";
  title?: string;
  className?: string;
};

export function PlanningPeriodSummaryBadge({
  statusLabel,
  periodLabel,
  metaLabel,
  tone = "active",
  align = "center",
  title,
  className = "",
}: PlanningPeriodSummaryBadgeProps) {
  const wrapClass = align === "center" ? "flex justify-center px-1" : "";

  return (
    <div className={wrapClass}>
      <span
        className={`${badgeBase} ${toneClasses[tone]} ${className}`.trim()}
        title={title ?? `${statusLabel} ${periodLabel}${metaLabel ? ` · ${metaLabel}` : ""}`}
      >
        <span className={tone === "active" ? "text-brand-dark/70" : "opacity-80"}>{statusLabel} :</span>
        <span className="font-semibold">{periodLabel}</span>
        {metaLabel ? (
          <>
            <span className="hidden text-brand-dark/50 sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="text-brand-dark/65">{metaLabel}</span>
          </>
        ) : null}
      </span>
    </div>
  );
}
