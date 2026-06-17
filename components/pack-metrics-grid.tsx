type PackMetricsGridProps = {
  price: string;
  sessions: string;
  duration: string;
  className?: string;
};

/** Prix | Séances (étroit) | Durée — même logique que les cartes packs publiques. */
export function PackMetricsGrid({ price, sessions, duration, className = "" }: PackMetricsGridProps) {
  return (
    <div
      className={`grid gap-0 text-center [grid-template-columns:minmax(0,0.88fr)_minmax(2.85rem,0.66fr)_minmax(0,0.96fr)] ${className}`.trim()}
      role="group"
      aria-label={`Prix ${price}, séances ${sessions}, durée ${duration}`}
    >
      <div className="min-w-0 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/50">Prix</p>
        <p className="mt-1 break-words text-base font-bold tabular-nums leading-tight text-brand-dark">
          {price}
        </p>
      </div>
      <div className="min-w-0 border-l border-brand-medium/25 px-1">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-dark/50 sm:text-[10px] sm:tracking-wider">
          Séances
        </p>
        <p className="mt-1 whitespace-nowrap text-base font-bold tabular-nums leading-tight text-brand-dark">
          {sessions}
        </p>
      </div>
      <div className="min-w-0 border-l border-brand-medium/25 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/50">Durée</p>
        <p className="mt-1 break-words text-base font-bold leading-tight text-brand-dark">{duration}</p>
      </div>
    </div>
  );
}
