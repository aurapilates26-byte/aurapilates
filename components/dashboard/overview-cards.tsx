type DashboardOverviewCardsProps = {
  role: "ADMIN" | "MEMBRE";
  memberStats?: {
    reservedThisWeek: number;
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
  /** "stat" = chiffre mis en avant ; "detail" = texte long, taille réduite */
  valueStyle: "stat" | "detail";
};

const contentByRole: OverviewCard[] = [
  { title: "Utilisateurs", value: "128", description: "Comptes actifs sur la plateforme.", valueStyle: "stat" },
  { title: "Réservations", value: "42", description: "Réservations en attente de suivi.", valueStyle: "stat" },
  { title: "Cours actifs", value: "12", description: "Cours actuellement visibles par les membres.", valueStyle: "stat" },
];

function valueClassName(style: OverviewCard["valueStyle"]) {
  if (style === "detail") {
    return "mt-1.5 text-[12px] font-medium leading-tight text-brand-dark/90 whitespace-nowrap overflow-hidden text-ellipsis sm:mt-2 sm:text-[13px] md:text-sm lg:mt-2.5 lg:text-base lg:font-semibold";
  }
  return "mt-2 text-[1.8rem] font-semibold leading-none tracking-tight text-brand-dark sm:mt-2.5 sm:text-[2rem] lg:mt-3 lg:text-[2.15rem] lg:font-bold";
}

export function DashboardOverviewCards({ role, memberStats }: DashboardOverviewCardsProps) {
  const cards: OverviewCard[] =
    role === "MEMBRE"
      ? [
          {
            title: "Cours réservés",
            value: String(memberStats?.reservedThisWeek ?? 0),
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
        ]
      : contentByRole;

  const gridClass =
    role === "MEMBRE"
      ? "grid grid-cols-2 gap-3 sm:gap-4 md:gap-4 lg:grid-cols-4"
      : "grid grid-cols-1 gap-4 xl:grid-cols-3";

  return (
    <div className={gridClass}>
      {cards.map((card) => (
        <article
          key={card.title}
          className="min-w-0 rounded-2xl border border-brand-medium/20 bg-white p-3.5 text-center shadow-sm sm:p-4 lg:p-5"
        >
          <p className="text-xs font-extrabold tracking-tight text-brand-dark sm:text-sm lg:text-[15px]">{card.title}</p>
          <p className={valueClassName(card.valueStyle)}>{card.value}</p>
          {card.valueSecondary ? (
            <p className={`${valueClassName(card.valueStyle)} mt-0.5 sm:mt-1`}>{card.valueSecondary}</p>
          ) : null}
          {card.description ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-brand-dark/75 whitespace-nowrap overflow-hidden text-ellipsis sm:mt-2 sm:text-xs lg:text-sm">
              {card.description}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
