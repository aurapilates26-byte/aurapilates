type DashboardOverviewCardsProps = {
  memberStats?: {
    reservedThisWeek: number;
    reservedWaitlist?: number;
    nextSessionDateYmd: string;
    nextSessionDayAndTime: string;
    subscriptionPackLine: string;
    subscriptionStatusLine: string;
    packExpiresLabel: string;
    packCreatedLabel: string;
  };
};

type OverviewCard = {
  title: string;
  value: string;
  valueSecondary?: string;
  description?: string;
  /** "stat" = chiffre mis en avant ; "detail" = lignes texte (abonnement, dates) */
  valueStyle: "stat" | "detail";
};

function isPlaceholderValue(value: string) {
  const t = value.trim();
  return t === "" || t === "—" || t === "-";
}

/** Chiffre (ex. cours réservés). */
function statValueClassName() {
  return "mt-2 text-[1.65rem] font-semibold leading-none tracking-tight text-brand-dark sm:mt-2.5 sm:text-[1.85rem] lg:mt-3 lg:text-[2rem] lg:font-bold";
}

/** Tiret vide (prochaine séance, etc.) — plus discret que le chiffre stat. */
function placeholderValueClassName() {
  return "mt-1.5 text-base font-medium leading-none text-brand-dark/35 sm:mt-2 sm:text-lg lg:mt-2 lg:text-xl";
}

/** Texte informatif (pack, dates) — taille réduite et cohérente sur tous les écrans. */
function detailValueClassName() {
  return [
    "mt-1.5 text-[10px] font-medium leading-snug text-brand-dark/88",
    "line-clamp-2 break-words hyphens-auto",
    "sm:mt-1.5 sm:text-[11px]",
    "md:text-xs md:leading-snug",
    "lg:mt-2 lg:text-[13px]",
  ].join(" ");
}

function valueClassName(style: OverviewCard["valueStyle"], value: string) {
  if (style === "stat") return statValueClassName();
  if (isPlaceholderValue(value)) return placeholderValueClassName();
  return detailValueClassName();
}

export function DashboardOverviewCards({ memberStats }: DashboardOverviewCardsProps) {
  const cards: OverviewCard[] = [
    {
      title: "Cours réservés",
      value: String(memberStats?.reservedThisWeek ?? 0),
      valueSecondary:
        (memberStats?.reservedWaitlist ?? 0) > 0
          ? `dont ${memberStats!.reservedWaitlist} en attente`
          : undefined,
      valueStyle: "stat",
    },
    {
      title: "Prochaine séance",
      value: memberStats?.nextSessionDayAndTime ?? "—",
      valueSecondary: memberStats?.nextSessionDateYmd ?? "—",
      valueStyle: "detail",
    },
    {
      title: "Abonnement",
      value: memberStats?.subscriptionPackLine ?? "—",
      valueSecondary: memberStats?.subscriptionStatusLine ?? "—",
      valueStyle: "detail",
    },
    {
      title: "Fin du pack",
      value: memberStats?.packCreatedLabel ?? "—",
      valueSecondary: memberStats?.packExpiresLabel ?? "—",
      valueStyle: "detail",
    },
  ];

  const gridClass = "grid grid-cols-2 gap-3 sm:gap-4 md:gap-4 lg:grid-cols-4";

  return (
    <div className={gridClass}>
      {cards.map((card) => (
        <article
          key={card.title}
          className="flex min-w-0 flex-col rounded-2xl border border-brand-medium/20 bg-white p-3 text-center shadow-sm sm:p-3.5 lg:p-4"
        >
          <p className="text-[11px] font-extrabold tracking-tight text-brand-dark sm:text-xs lg:text-[13px]">
            {card.title}
          </p>
          <p className={valueClassName(card.valueStyle, card.value)} title={card.value}>
            {card.value}
          </p>
          {card.valueSecondary ? (
            <p
              className={`${
                card.valueStyle === "stat"
                  ? "mt-1 text-[10px] font-medium text-brand-dark/70 sm:text-[11px]"
                  : `${valueClassName(card.valueStyle, card.valueSecondary)} mt-0.5 sm:mt-0.5`
              }`}
              title={card.valueSecondary}
            >
              {card.valueSecondary}
            </p>
          ) : null}
          {card.description ? (
            <p className="mt-1 text-[10px] leading-relaxed text-brand-dark/75 line-clamp-2 sm:mt-1.5 sm:text-[11px] md:text-xs">
              {card.description}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
