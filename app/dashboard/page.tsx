import { DashboardOverviewCards } from "@/components/dashboard/overview-cards";
import { DashboardHeader } from "@/components/dashboard/header";
import { MemberMyReservations } from "@/components/dashboard/member-my-reservations";
import { MemberReservationsClient } from "@/components/dashboard/member-reservations-client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  isSessionSlotEndedLocal,
  parseYmdLocal,
  prismaDateGteFromLocal,
  startOfLocalToday,
} from "@/lib/calendar-day";

const contentByRole = {
  ADMIN: {
    title: "Pilotage global du studio",
    highlightsTitle: "Priorites administrateur",
    highlights: [
      "Verifier les nouvelles inscriptions et leur attribution de role.",
      "Superviser les reservations des cours et l'occupation des places.",
      "Mettre a jour les contenus visibles par les membres depuis un espace unique.",
    ],
  },
  MEMBRE: {
    title: "Votre espace personnel",
    highlightsTitle: "Mes reservations",
    highlights: [
      "Consulter les cours disponibles selon votre abonnement.",
      "Retrouver rapidement vos reservations a venir.",
      "Mettre a jour vos informations personnelles et suivre votre progression.",
    ],
  },
} as const;

export default async function DashboardPage() {
  const session = await requireUser();
  const role = session.user.role === "ADMIN" ? "ADMIN" : "MEMBRE";
  const content = contentByRole[role];

  const memberStats =
    role === "MEMBRE"
      ? await (async () => {
          const member = await prisma.member.findUnique({
            where: { userId: session.user.id },
            include: {
              pack: { select: { name: true, durationDays: true, sessionCount: true, courseQuotas: true } },
              packBalances: true,
              user: { select: { email: true, name: true } },
            },
          });

          if (!member) {
            return {
              displayName: null as string | null,
              reservedThisWeek: 0,
              nextSessionDateYmd: "—",
              nextSessionDayAndTime: "—",
              subscriptionPackLine: "—",
              subscriptionStatusLine: "Profil introuvable",
              packExpiresLabel: "—",
              packCreatedLabel: "—",
            };
          }
          const displayName = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || null;

          const today = startOfLocalToday();
          const upcomingFrom = prismaDateGteFromLocal(today);

          const fromYmd = formatYmdLocal(today);
          const upcomingCandidates = await prisma.reservation.findMany({
            where: {
              memberId: member.id,
              sessionDate: { gte: prismaDateGteFromLocal(today) },
              status: { in: ["BOOKED", "WAITLIST"] },
            },
            orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
            take: 40,
            include: { planning: true },
          });
          const upcoming =
            upcomingCandidates.find((r) => {
              const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
              return ymd >= fromYmd && !isSessionSlotEndedLocal(ymd, r.planning.endTime);
            }) ?? null;

          const reservedThisWeek = await prisma.reservation.count({
            where: {
              memberId: member.id,
              sessionDate: { gte: upcomingFrom },
              status: { in: ["BOOKED", "WAITLIST"] },
            },
          });

          const sessionCount = member.pack?.sessionCount ?? null;
          const courseQuotas = member.pack?.courseQuotas?.length ? member.pack.courseQuotas : null;
          const balancesForCurrentPack =
            member.packId && member.packBalances.length
              ? member.packBalances.filter((b) => b.packId === member.packId)
              : [];
          const simpleBalance = balancesForCurrentPack.find((b) => b.courseSlug == null) ?? null;

          const packStartDate = member.packStartedAt
            ? new Date(
                member.packStartedAt.getFullYear(),
                member.packStartedAt.getMonth(),
                member.packStartedAt.getDate(),
              )
            : null;

          const expiresAt =
            member.packStartedAt && member.pack?.durationDays
              ? new Date(member.packStartedAt.getTime() + member.pack.durationDays * 24 * 60 * 60 * 1000)
              : null;

          /**
           * Séances comptées sur le pack (période packStartedAt → fin du pack) :
           * BOOKED / ATTENDED comme avant, plus CANCELLED pour rester aligné avec l'historique membre
           * (une annulation retire le statut BOOKED mais la ligne reste visible dans Historique).
           */
          const sessionsAllocated =
            packStartDate && sessionCount != null
              ? await prisma.reservation.count({
                  where: {
                    memberId: member.id,
                    OR: [
                      { status: { in: ["BOOKED", "ATTENDED"] } },
                      { status: "CANCELLED", packRefundedAt: null },
                    ],
                    sessionDate: {
                      gte: packStartDate,
                      ...(expiresAt ? { lte: expiresAt } : {}),
                    },
                  },
                })
              : 0;

          const remaining =
            sessionCount == null
              ? null
              : simpleBalance
                ? Math.max(0, simpleBalance.remaining)
                : Math.max(0, sessionCount - sessionsAllocated);

          const mixedRemainingLine = await (async () => {
            if (!courseQuotas || !packStartDate) return null;
            if (balancesForCurrentPack.length) {
              const parts = courseQuotas.map((q) => {
                const bal = balancesForCurrentPack.find((b) => b.courseSlug === q.courseSlug)?.remaining ?? 0;
                const label = q.courseSlug === "pilates-reformer" ? "Reformer" : q.courseSlug === "mat-pilates" ? "Mat" : q.courseSlug;
                return `${label} ${Math.max(0, bal)}/${q.sessionCount}`;
              });
              return parts.join(" · ");
            }

            // Fallback to legacy recount if balances are missing.
            const booked = await prisma.reservation.findMany({
              where: {
                memberId: member.id,
                OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
                sessionDate: {
                  gte: packStartDate,
                  ...(expiresAt ? { lte: expiresAt } : {}),
                },
                planning: { courseSlug: { in: courseQuotas.map((q) => q.courseSlug) } },
              },
              select: { planning: { select: { courseSlug: true } } },
            });

            const usedBySlug = new Map<string, number>();
            for (const r of booked) {
              usedBySlug.set(r.planning.courseSlug, (usedBySlug.get(r.planning.courseSlug) ?? 0) + 1);
            }

            const parts = courseQuotas.map((q) => {
              const used = usedBySlug.get(q.courseSlug) ?? 0;
              const left = Math.max(0, q.sessionCount - used);
              const label = q.courseSlug === "pilates-reformer" ? "Reformer" : q.courseSlug === "mat-pilates" ? "Mat" : q.courseSlug;
              return `${label} ${left}/${q.sessionCount}`;
            });
            return parts.join(" · ");
          })();

          const isActive =
            Boolean(member.isActive) &&
            Boolean(member.packId) &&
            (expiresAt ? expiresAt.getTime() >= today.getTime() : true);

          const nextSessionDateYmd = !upcoming ? "—" : formatYmdPrismaDate(new Date(upcoming.sessionDate));
          const nextSessionDayAndTime = !upcoming
            ? "—"
            : (() => {
                const cal = parseYmdLocal(formatYmdPrismaDate(new Date(upcoming.sessionDate)));
                if (!cal) return "—";
                const weekday = cal
                  .toLocaleDateString("fr-FR", { weekday: "long" })
                  .replace(/^\p{L}/u, (c) => c.toUpperCase());
                return `${weekday} · ${upcoming.planning.startTime}`;
              })();
          const nextSessionDateLabel = (() => {
            if (nextSessionDateYmd === "—") return "—";
            const cal = parseYmdLocal(nextSessionDateYmd);
            if (!cal) return nextSessionDateYmd;
            const day = String(cal.getDate()).padStart(2, "0");
            const month = String(cal.getMonth() + 1).padStart(2, "0");
            const year = cal.getFullYear();
            return `${day}/${month}/${year}`;
          })();

          const packExpiresLabelRaw =
            expiresAt != null
              ? expiresAt
                  .toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  .replace(/^\p{L}/u, (c) => c.toUpperCase())
              : member.packId && member.pack?.durationDays && !member.packStartedAt
                ? "Apres la date d'achat du pack"
                : "—";
          const packExpiresLabel = packExpiresLabelRaw === "—" ? "Au —" : `Au ${packExpiresLabelRaw}`;
          const packCreatedLabel = member.packStartedAt
            ? (() => {
                const d = new Date(
                  member.packStartedAt.getFullYear(),
                  member.packStartedAt.getMonth(),
                  member.packStartedAt.getDate(),
                );
                const day = String(d.getDate()).padStart(2, "0");
                const month = d.toLocaleDateString("fr-FR", { month: "long" });
                const year = d.getFullYear();
                return `Du ${day} ${month} ${year}`;
              })()
            : "Du —";

          const subscriptionPackLine =
            member.pack != null
              ? `Pack : ${member.pack.name}${member.pack.durationDays ? ` · ${member.pack.durationDays} jours` : ""}`
              : "Pack : —";
          const subscriptionStatusLine =
            mixedRemainingLine
              ? `${isActive ? "Actif" : "Inactif"} · ${mixedRemainingLine}`
              : sessionCount != null
                ? `${isActive ? "Actif" : "Inactif"} reste ${remaining ?? 0}/${sessionCount}`
              : isActive
                ? "Actif"
                : "Inactif";

          return {
            displayName,
            reservedThisWeek,
            nextSessionDateYmd: nextSessionDateLabel,
            nextSessionDayAndTime,
            subscriptionPackLine,
            subscriptionStatusLine,
            packExpiresLabel,
            packCreatedLabel,
          };
        })()
      : undefined;

  return (
    <>
      <DashboardHeader role={role} title={role === "MEMBRE" ? memberStats?.displayName ?? content.title : content.title} />
      <DashboardOverviewCards role={role} memberStats={memberStats} />

      {role === "MEMBRE" ? (
        <>
          <MemberMyReservations />
          <MemberReservationsClient embedded />
        </>
      ) : (
        <section className="mt-6 rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">{content.highlightsTitle}</h2>
          <ul className="mt-4 space-y-3 text-sm text-brand-dark/80">
            {content.highlights.map((item) => (
              <li key={item} className="rounded-lg bg-brand-light/30 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
