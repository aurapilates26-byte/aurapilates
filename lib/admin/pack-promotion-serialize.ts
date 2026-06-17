import { formatYmdPrismaDate } from "@/lib/calendar-day";
import {
  formatPromotionScopeLabel,
  type PromotionWithTargets,
} from "@/lib/admin/pack-promotion-scope";
import { getPackPromotionLifecycle } from "@/lib/pack-pricing";
import type { AdminPackPromotionItem } from "@/types/admin/pack-promotion";

export function serializePackPromotion(row: PromotionWithTargets): AdminPackPromotionItem {
  return {
    id: row.id,
    label: row.label,
    appliesToAll: row.appliesToAll,
    packIds: row.targetPacks.map((t) => t.packId),
    packNames: row.targetPacks.map((t) => t.pack.name),
    scopeLabel: formatPromotionScopeLabel(row),
    discountType: "PERCENT",
    discountValue: row.discountValue,
    startsAt: formatYmdPrismaDate(row.startsAt),
    endsAt: formatYmdPrismaDate(row.endsAt),
    isActive: row.isActive,
    lifecycle: getPackPromotionLifecycle({
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      isActive: row.isActive,
    }),
  };
}
