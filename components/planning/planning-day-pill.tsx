"use client";

type PlanningDayPillProps = {
  dayLabel: string;
  /** Dates calendaires de la période (ex. 26/05 ou 26/05 · 02/06). */
  dateLabel?: string | null;
  active?: boolean;
  onClick?: () => void;
  /** Nombre de séances (admin / public). */
  count?: number;
  /** Point indicateur réservation membre. */
  showReservationDot?: boolean;
  className?: string;
};

const pillBase =
  "inline-flex shrink-0 flex-col items-center gap-0.5 rounded-full border px-2.5 py-1.5 text-center transition sm:px-3 sm:py-2";

export function PlanningDayPill({
  dayLabel,
  dateLabel,
  active = false,
  onClick,
  count,
  showReservationDot = false,
  className = "",
}: PlanningDayPillProps) {
  const tone = active
    ? "border-brand-dark/30 bg-brand-dark text-white"
    : "border-brand-medium/35 bg-white text-brand-dark/80 shadow-sm hover:bg-zinc-50";

  return (
    <button type="button" onClick={onClick} className={`${pillBase} ${tone} ${className}`.trim()}>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase leading-tight sm:text-xs">{dayLabel}</span>
        {typeof count === "number" ? (
          <span
            className={`tabular-nums text-[10px] font-semibold sm:text-[11px] ${
              active ? "text-white/90" : "text-brand-dark/50"
            }`}
            aria-label={`${count} séance${count > 1 ? "s" : ""}`}
          >
            ({count})
          </span>
        ) : null}
        {showReservationDot ? (
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-white" : "bg-brand-dark"}`}
            title="Vous avez une réservation ce jour-là"
            aria-hidden
          />
        ) : null}
      </span>
      {dateLabel ? (
        <span
          className={`max-w-[5.5rem] text-[10px] font-medium leading-tight tabular-nums sm:max-w-none sm:text-[11px] ${
            active ? "text-white/85" : "text-brand-dark/55"
          }`}
        >
          {dateLabel}
        </span>
      ) : null}
    </button>
  );
}
