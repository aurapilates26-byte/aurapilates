import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PublicPacksPricingClient } from "@/components/public/public-packs-pricing-client";
import { PACK_CATEGORIES } from "@/lib/pack-categories";
import { computePackSessionsDisplay, formatPackDurationDisplay, formatPackPriceDt } from "@/lib/public-pack-display";

const packsInclude = {
  features: { orderBy: { sortOrder: "asc" as const }, select: { label: true } },
  courseQuotas: { select: { courseSlug: true, sessionCount: true } },
} satisfies Prisma.PackInclude;

type PackRow = Prisma.PackGetPayload<{ include: typeof packsInclude }>;

export type PublicPackCard = {
  id: string;
  category: string | null;
  name: string;
  sessionCount: number | null;
  priceCents: number | null;
  durationDays: string | null;
  features: string[];
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  /** Précalculé côté serveur (hydration-safe). */
  priceDisplay: string | null;
  durationDisplay: string | null;
  sessionsDisplay: number | null;
};

export async function PublicPacksPricing() {
  let packs: PackRow[] = [];

  try {
    packs = await prisma.pack.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
      include: packsInclude,
    });
  } catch {
    packs = [];
  }

  const cards: PublicPackCard[] = packs.map((p) => {
    const courseQuotas = p.courseQuotas;
    return {
      id: p.id,
      category: p.category,
      name: p.name,
      sessionCount: p.sessionCount,
      priceCents: p.priceCents,
      durationDays: p.durationDays,
      features: p.features.map((f) => f.label),
      courseQuotas,
      priceDisplay: formatPackPriceDt(p.priceCents),
      durationDisplay: formatPackDurationDisplay(p.durationDays),
      sessionsDisplay: computePackSessionsDisplay({
        sessionCount: p.sessionCount,
        courseQuotas,
      }),
    };
  });

  return (
    <PublicPacksPricingClient
      packs={cards}
      canonicalCategories={PACK_CATEGORIES as readonly string[]}
    />
  );
}

