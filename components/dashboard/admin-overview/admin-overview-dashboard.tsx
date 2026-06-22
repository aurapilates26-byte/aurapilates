import Link from "next/link";
import type { ReactNode } from "react";
import { memberCountLabel } from "@/lib/member-label-fr";
import type {
  AdminOverviewPackCategoryGroup,
  AdminOverviewPackLine,
  AdminOverviewReservationPeriod,
  AdminOverviewSnapshot,
  AdminOverviewWatchItem,
} from "@/types/admin/overview";

type PulseCardConfig = {
  id: string;
  title: string;
  value: number | string;
  hint: string;
  href: string;
  pageHref: string;
  emphasis?: "default" | "warning";
};

function PulseCard({ card }: { card: PulseCardConfig }) {
  const border =
    card.emphasis === "warning"
      ? "border-amber-300/80 ring-1 ring-amber-200/50"
      : "border-brand-medium/20";
  return (
    <a
      href={card.href}
      className="group block min-w-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40"
    >
      <article
        className={`relative min-w-0 overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition group-hover:shadow-md sm:p-4 md:p-4 xl:p-3 2xl:p-3.5 ${border}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-light/35 via-transparent to-transparent" />
        <div className="relative flex flex-col items-center gap-1 text-center sm:gap-1.5">
          <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.1em] text-brand-dark/70 sm:text-xs xl:text-[10px] xl:tracking-[0.08em]">
            {card.title}
          </p>
          <p className="text-xl font-bold tracking-tight text-brand-dark sm:text-2xl md:text-2xl xl:text-lg 2xl:text-xl">
            {card.value}
          </p>
          <p className="text-[10px] leading-snug text-brand-dark/65 sm:text-xs xl:line-clamp-2 xl:text-[10px]">
            {card.hint}
          </p>
        </div>
      </article>
    </a>
  );
}

function DetailSection({
  id,
  title,
  description,
  pageHref,
  pageLabel,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  pageHref: string;
  pageLabel: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-brand-medium/15 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-medium/10 pb-4">
        <div>
          <h3 id={`${id}-heading`} className="text-lg font-semibold text-brand-dark">
            {title}
          </h3>
          {description ? <p className="mt-1 text-sm text-brand-dark/60">{description}</p> : null}
        </div>
        <Link
          href={pageHref}
          className="inline-flex shrink-0 items-center rounded-lg border border-brand-medium/25 bg-brand-dark/5 px-3 py-2 text-xs font-semibold text-brand-dark transition hover:bg-brand-dark/10"
        >
          {pageLabel}
          <span className="ml-1" aria-hidden>
            →
          </span>
        </Link>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-medium/10 bg-zinc-50/80 px-3 py-2.5">
      <span className="text-sm text-brand-dark/70">{label}</span>
      <span className="text-sm font-bold tabular-nums text-brand-dark">{value}</span>
    </div>
  );
}

function MemberStatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-xl border border-brand-medium/10 bg-zinc-50/80 px-3 py-3 text-center sm:gap-1.5 sm:px-4 sm:py-3.5">
      <span className="text-xs font-bold text-brand-dark/75 sm:text-sm">{label}</span>
      <span className="text-xl font-bold tabular-nums text-brand-dark sm:text-2xl">{value}</span>
      {hint ? (
        <p className="max-w-full px-0.5 text-[10px] leading-[1.2] text-brand-dark/55 md:text-[11px] md:leading-tight md:whitespace-nowrap">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function MemberPeriodCard({
  periodLabel,
  subtitle,
  count,
}: {
  periodLabel: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="flex min-w-0 w-full flex-col items-center gap-1 rounded-xl border border-brand-medium/12 bg-zinc-50/50 px-3 py-3 text-center sm:gap-1.5 sm:px-4 sm:py-3.5">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-dark/70">{periodLabel}</p>
      <p className="text-xl font-bold tabular-nums text-brand-dark sm:text-2xl">{count}</p>
      <p className="text-xs leading-snug text-brand-dark/65 sm:text-sm">{subtitle}</p>
    </div>
  );
}

function formatPct(pct: number | null): string {
  return pct != null ? `${pct}%` : "—";
}

function formatPackMemberCount(count: number): string {
  return memberCountLabel(count);
}

function PackLineRow({ pack }: { pack: AdminOverviewPackLine }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-brand-medium/8 px-3 py-2.5 last:border-0 sm:px-4">
      <span className="min-w-0 text-sm text-brand-dark/80" title={pack.name}>
        {pack.name}
        {!pack.isActive ? (
          <span className="ml-1 text-xs font-medium text-brand-dark/45">(inactif)</span>
        ) : null}
      </span>
      <span className="shrink-0 text-sm font-bold tabular-nums text-brand-dark">
        {formatPackMemberCount(pack.memberCount)}
      </span>
    </li>
  );
}

/** Une ligne = une catégorie, puis la liste des packs en dessous (pleine largeur). */
function PackCategoryRow({ group }: { group: AdminOverviewPackCategoryGroup }) {
  const hasPacks = group.packs.length > 0;
  const totalMembers = group.packs.reduce((sum, pack) => sum + pack.memberCount, 0);

  return (
    <div className="border-b border-brand-medium/12 py-4 last:border-0 last:pb-0 first:pt-0">
      <div className="flex items-start justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-2">
          <h4 className="text-sm font-bold text-brand-dark sm:text-base">{group.label}</h4>
          <span className="text-xs font-medium tabular-nums text-brand-dark/55 sm:text-sm">
            {formatPackMemberCount(totalMembers)}
          </span>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-brand-dark/50 sm:text-sm">
          {hasPacks ? `${group.packs.length} pack${group.packs.length > 1 ? "s" : ""}` : "Aucun pack"}
        </span>
      </div>
      {hasPacks ? (
        <ul className="mt-2 overflow-hidden rounded-xl border border-brand-medium/10 bg-white">
          {group.packs.map((pack) => (
            <PackLineRow key={pack.id} pack={pack} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-brand-dark/45">—</p>
      )}
    </div>
  );
}

function sortPackCategories(groups: AdminOverviewPackCategoryGroup[]): AdminOverviewPackCategoryGroup[] {
  return [...groups].sort((a, b) => {
    if (a.packs.length > 0 && b.packs.length === 0) return -1;
    if (a.packs.length === 0 && b.packs.length > 0) return 1;
    return a.label.localeCompare(b.label, "fr");
  });
}

function ReservationStatsGrid({ period }: { period: AdminOverviewReservationPeriod }) {
  return (
    <div className="grid w-full grid-cols-2 items-start gap-2 md:grid-cols-3 md:gap-3">
      <MemberStatCard label="Réservations" value={period.totalActive} />
      <MemberStatCard label="Présents" value={period.attended} />
      <div className="col-span-2 md:col-span-1">
        <MemberStatCard label="Taux de présence" value={formatPct(period.presenceRatePct)} />
      </div>
    </div>
  );
}

function ReservationTodayStats({
  period,
  todayYmd,
  dayLabel,
}: {
  period: AdminOverviewReservationPeriod;
  todayYmd: string;
  dayLabel: string;
}) {
  const showWaitlist = period.waitlist > 0;
  const showCancelled = period.cancelled > 0;

  return (
    <div className="rounded-xl border border-brand-medium/20 bg-white p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">Aujourd&apos;hui</p>
          <p className="mt-0.5 text-[11px] text-brand-dark/45">{dayLabel}</p>
        </div>
        <Link
          href={`/dashboard/reservations-admin?date=${todayYmd}`}
          className="text-[11px] font-semibold text-brand-dark/60 underline-offset-2 hover:text-brand-dark hover:underline"
        >
          Voir les créneaux →
        </Link>
      </div>
      <ReservationStatsGrid period={period} />
      {showWaitlist || showCancelled ? (
        <ul className="mt-2 overflow-hidden rounded-lg border border-brand-medium/10 bg-zinc-50/80">
          {showWaitlist ? (
            <li className="flex items-center justify-between gap-3 border-b border-brand-medium/8 px-3 py-2 text-sm">
              <span className="text-brand-dark/75">Liste d&apos;attente</span>
              <span className="font-bold tabular-nums text-brand-dark">{period.waitlist}</span>
            </li>
          ) : null}
          {showCancelled ? (
            <li className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="text-brand-dark/75">Annulées</span>
              <span className="font-bold tabular-nums text-brand-dark">{period.cancelled}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

function WatchCard({ item }: { item: AdminOverviewWatchItem }) {
  const accent =
    item.variant === "attention"
      ? "border-amber-200/80 bg-amber-50/60"
      : "border-brand-medium/20 bg-zinc-50/80";
  return (
    <li
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${accent}`}
    >
      <div className="min-w-0">
        <p className="font-semibold text-brand-dark">{item.title}</p>
        <p className="mt-1 text-sm text-brand-dark/70">{item.description}</p>
      </div>
      <Link
        href={item.href}
        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-brand-medium/25 bg-white px-3 py-2 text-xs font-semibold text-brand-dark transition hover:bg-brand-dark/5"
      >
        Voir
        <span className="ml-1" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}

type AdminOverviewDashboardProps = {
  data: AdminOverviewSnapshot;
};

export function AdminOverviewDashboard({ data }: AdminOverviewDashboardProps) {
  const { pulse, details } = data;
  const globalReservations = details.reservations.global;
  const globalPresenceRateDisplay = formatPct(globalReservations.presenceRatePct);
  const packCategoriesSorted = sortPackCategories(details.packs.byCategory);
  const packCategoriesWithStock = packCategoriesSorted.filter((g) => g.packs.length > 0).length;

  /** Cartes du haut = vue studio (global). Le détail par jour est dans chaque section. */
  const cards: PulseCardConfig[] = [
    {
      id: "overview-presence",
      title: "Présence",
      value: globalReservations.attended,
      hint: `studio · ${globalReservations.totalActive} réservation${globalReservations.totalActive > 1 ? "s" : ""} · ${globalPresenceRateDisplay} taux`,
      href: "#overview-reservations",
      pageHref: "/dashboard/presence",
    },
    {
      id: "overview-members",
      title: "Adhérentes",
      value: pulse.members.total,
      hint: `studio · ${pulse.members.active} actifs · ${pulse.members.expired} expiré${pulse.members.expired > 1 ? "s" : ""}`,
      href: "#overview-members",
      pageHref: "/dashboard/adherents",
    },
    {
      id: "overview-planning",
      title: "Planning",
      value: pulse.planning.slotsTotal,
      hint: `studio · ${pulse.planning.slotsToday} créneau${pulse.planning.slotsToday > 1 ? "x" : ""} aujourd'hui`,
      href: "#overview-planning",
      pageHref: "/dashboard/planning",
    },
    {
      id: "overview-packs",
      title: "Packs",
      value: pulse.packs.activePacks,
      hint: `catalogue · ${pulse.packs.packsTotal} packs · ${pulse.packs.categoriesCount} catégories`,
      href: "#overview-packs",
      pageHref: "/dashboard/packs",
    },
  ];

  return (
    <div className="space-y-8">
      <section aria-label="Indicateurs du studio">
        <div className="grid grid-cols-2 items-start gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-3">
          {cards.map((card) => (
            <PulseCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <DetailSection
          id="overview-reservations"
          title="Réservations & présence"
          pageHref="/dashboard/reservations-admin"
          pageLabel="Voir les réservations"
        >
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-brand-dark/55">
              Réservations, présences et taux calculés à partir des inscriptions (statut présent = pointage
              enregistré).{" "}
              <Link href="/dashboard/presence" className="font-semibold text-brand-dark underline-offset-2 hover:underline">
                Ouvrir la page Présence
              </Link>{" "}
              pour le scan QR du jour.
            </p>
            <ReservationTodayStats
              period={details.reservations.today}
              todayYmd={data.todayYmd}
              dayLabel={data.dayLabel}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                Studio (toutes périodes)
              </p>
              <div className="mt-2">
                <ReservationStatsGrid period={details.reservations.global} />
              </div>
            </div>
            <p className="text-[11px] text-brand-dark/45">
              Bloc du jour synchronisé avec les créneaux horaires (rafraîchissement automatique toutes les
              30 s).
            </p>
          </div>
        </DetailSection>

        <DetailSection
          id="overview-members"
          title="Adhérentes"
          pageHref="/dashboard/adherents"
          pageLabel="Gérer les adhérentes"
        >
          <div className="space-y-4">
            <div className="flex w-full flex-wrap items-start gap-2 sm:gap-3">
              <div className="w-[calc(50%-0.25rem)] md:flex-1 md:basis-0">
                <MemberPeriodCard
                  periodLabel="7 derniers jours"
                  subtitle={details.members.last7dRangeLabel}
                  count={details.members.newLast7Days}
                />
              </div>
              <div className="w-[calc(50%-0.25rem)] md:flex-1 md:basis-0">
                <MemberPeriodCard
                  periodLabel="15 derniers jours"
                  subtitle={details.members.last15dRangeLabel}
                  count={details.members.newLast15Days}
                />
              </div>
              <div className="w-full md:flex-1 md:basis-0">
                <MemberPeriodCard
                  periodLabel="Mois dernier"
                  subtitle={details.members.lastMonthLabel}
                  count={details.members.newLastMonth}
                />
              </div>
            </div>
            <div className="grid w-full grid-cols-2 items-start gap-2 md:grid-cols-4 md:gap-3">
              <MemberStatCard
                label="Adhérentes actives"
                value={pulse.members.active}
                hint="Pack démarré, période valide."
              />
              <MemberStatCard
                label="En attente"
                value={pulse.members.pending}
                hint="Pack sans séance réservée."
              />
              <MemberStatCard
                label="Pack expiré"
                value={pulse.members.expired}
                hint="Validité du pack dépassée."
              />
              <MemberStatCard
                label="Adhérentes renouvelées"
                value={pulse.members.renewed}
                hint="Au moins un renouvellement de pack."
              />
            </div>
            {pulse.members.noPack > 0 ? (
              <div className="grid w-full grid-cols-2 gap-2 md:max-w-[25%]">
                <MemberStatCard
                  label="Sans pack"
                  value={pulse.members.noPack}
                  hint="Sans pack assigné."
                />
              </div>
            ) : null}
          </div>
        </DetailSection>

        <DetailSection
          id="overview-qr"
          title="QR codes"
          pageHref="/dashboard/qr-code"
          pageLabel="Gérer les QR"
        >
          <div className="grid w-full grid-cols-2 items-start gap-2 md:grid-cols-4 md:gap-3">
            <MemberStatCard label="QR assignés" value={pulse.qr.assigned} />
            <MemberStatCard label="Total cartes" value={pulse.qr.total} />
            <MemberStatCard label="QR disponibles" value={pulse.qr.available} />
            <MemberStatCard label="Adhérentes sans QR" value={details.qr.membersWithoutQr} />
          </div>
        </DetailSection>

        <DetailSection
          id="overview-packs"
          title="Packs"
          pageHref="/dashboard/packs"
          pageLabel="Gérer les packs"
        >
          <div className="space-y-4">
            <div className="grid w-full grid-cols-2 items-start gap-2 md:grid-cols-3 md:gap-3">
              <MemberStatCard label="Catégories" value={pulse.packs.categoriesCount} />
              <MemberStatCard label="Total packs" value={pulse.packs.packsTotal} />
              <div className="col-span-2 md:col-span-1">
                <MemberStatCard label="Packs actifs" value={pulse.packs.activePacks} />
              </div>
            </div>
            <div className="rounded-xl border border-brand-medium/12 bg-zinc-50/50 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                Packs par catégorie
              </p>
              <p className="mt-1 text-xs leading-relaxed text-brand-dark/55">
                {pulse.packs.packsTotal} pack{pulse.packs.packsTotal > 1 ? "s" : ""} ·{" "}
                {packCategoriesWithStock} catégorie{packCategoriesWithStock > 1 ? "s" : ""} avec des packs. Une
                catégorie par bloc, les packs listés en dessous.
              </p>
              <div className="mt-3">
                {packCategoriesSorted.map((group) => (
                  <PackCategoryRow key={group.category} group={group} />
                ))}
                {details.packs.withoutCategoryPacks.length > 0 ? (
                  <PackCategoryRow
                    group={{
                      category: "_none",
                      label: "Sans catégorie",
                      packs: details.packs.withoutCategoryPacks,
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          id="overview-planning"
          title="Séances planning"
          description="Créneaux récurrents définis dans le planning studio"
          pageHref="/dashboard/planning"
          pageLabel="Ouvrir le planning"
        >
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <DetailRow label="Créneaux au planning" value={pulse.planning.slotsTotal} />
            </div>
            <div className="rounded-xl border border-brand-medium/12 bg-zinc-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">Aujourd&apos;hui</p>
              <div className="mt-3">
                <DetailRow label="Créneaux ce jour" value={details.planning.slotsToday} />
              </div>
              {details.planning.slotsToday === 0 ? (
                <p className="mt-3 text-sm text-brand-dark/60">
                  Aucun créneau prévu aujourd&apos;hui (jour sans cours dans le planning).
                </p>
              ) : null}
            </div>
          </div>
        </DetailSection>

      </div>

      {data.watchItems.length > 0 || data.expiringPacks.length > 0 ? (
        <section
          className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm sm:p-6"
          aria-labelledby="overview-watch-heading"
        >
          <h2 id="overview-watch-heading" className="text-lg font-semibold text-brand-dark">
            À traiter
          </h2>
          <p className="mt-1 text-sm text-brand-dark/60">Actions recommandées</p>

          {data.watchItems.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {data.watchItems.map((item) => (
                <WatchCard key={item.id} item={item} />
              ))}
            </ul>
          ) : null}

          {data.expiringPacks.length > 0 ? (
            <div className={data.watchItems.length > 0 ? "mt-6 border-t border-brand-medium/10 pt-6" : "mt-4"}>
              <h3 className="text-sm font-semibold text-brand-dark">Packs qui expirent bientôt</h3>
              <ul className="mt-3 divide-y divide-brand-medium/10">
                {data.expiringPacks.map((pack) => (
                  <li
                    key={pack.memberId}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/adherents/${pack.memberId}`}
                        className="font-semibold text-brand-dark hover:underline"
                      >
                        {pack.memberName}
                      </Link>
                      <p className="text-xs text-brand-dark/65">
                        {pack.packName} — fin le {pack.expiresYmd}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      J-{pack.daysLeft}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
