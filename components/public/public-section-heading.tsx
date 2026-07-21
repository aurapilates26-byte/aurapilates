type PublicSectionHeadingProps = {
  /** Libellé court (affiché en petites capitales via CSS). */
  kicker?: string;
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

const kickerClass =
  "text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-dark/45 sm:text-xs";

const titleBaseClass =
  "text-center text-[clamp(1.65rem,4.2vw,2.25rem)] leading-tight tracking-tight text-brand-dark md:text-[2rem]";

const titleSpacingAfterKicker = "mt-3";

const subtitleClass =
  "mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-brand-dark/65 text-balance sm:text-[15px] md:mt-4 md:text-base md:leading-relaxed";

/**
 * En-tête de section page publique (kicker + titre + sous-titre), aligné sur les maquettes cours / FAQ / inscription.
 */
export function PublicSectionHeading({
  kicker,
  title,
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
}: PublicSectionHeadingProps) {
  return (
    <header className="mx-auto max-w-4xl px-1 text-center">
      {kicker ? <p className={kickerClass}>{kicker}</p> : null}
      <h2
        className={`${titleBaseClass} ${kicker ? titleSpacingAfterKicker : ""} ${titleClassName || "font-bold"}`.trim()}
      >
        {title}
      </h2>
      {subtitle ? <p className={`${subtitleClass} ${subtitleClassName}`.trim()}>{subtitle}</p> : null}
    </header>
  );
}
