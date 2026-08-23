export type ProspectTrialPackDto = {
  id: string;
  name: string;
  category: string | null;
  sessionCount: number | null;
  durationDays: string | null;
  features: string[];
  listPriceDinars: number;
  priceDisplay: string | null;
  originalPriceDisplay: string | null;
  hasPromotion: boolean;
  promotionLabel: string | null;
  durationDisplay: string | null;
  sessionLabel: string;
  courseLabel: string;
};
