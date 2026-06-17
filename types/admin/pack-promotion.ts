import type { PackPromotionLifecycle } from "@/lib/pack-pricing";

export type AdminPackPromotionItem = {
  id: string;
  label: string | null;
  appliesToAll: boolean;
  packIds: string[];
  packNames: string[];
  scopeLabel: string;
  discountType: "PERCENT";
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  lifecycle: PackPromotionLifecycle;
};
