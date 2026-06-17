/** Chiffres des 4 cartes du haut (pulse). */
export type AdminOverviewPulseCards = {
  members: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    renewed: number;
    noPack: number;
  };
  qr: {
    assigned: number;
    total: number;
    available: number;
  };
  packs: {
    categoriesCount: number;
    packsTotal: number;
    activePacks: number;
  };
  presence: {
    totalAttended: number;
  };
  planning: {
    slotsTotal: number;
    slotsToday: number;
  };
  presenceRate: {
    pct: number | null;
  };
};

export type AdminOverviewPackLine = {
  id: string;
  name: string;
  isActive: boolean;
  memberCount: number;
};

export type AdminOverviewPackCategoryGroup = {
  category: string;
  label: string;
  packs: AdminOverviewPackLine[];
};

/** Détail par période sous chaque carte. */
export type AdminOverviewReservationPeriod = {
  booked: number;
  waitlist: number;
  attended: number;
  cancelled: number;
  totalActive: number;
  presenceRatePct: number | null;
};

export type AdminOverviewDetails = {
  members: {
    newLast7Days: number;
    newLast15Days: number;
    newLastMonth: number;
    last7dRangeLabel: string;
    last15dRangeLabel: string;
    lastMonthLabel: string;
  };
  qr: {
    membersWithoutQr: number;
  };
  packs: {
    byCategory: AdminOverviewPackCategoryGroup[];
    withoutCategory: number;
    withoutCategoryPacks: AdminOverviewPackLine[];
  };
  reservations: {
    global: AdminOverviewReservationPeriod;
    today: AdminOverviewReservationPeriod;
  };
  planning: {
    slotsToday: number;
  };
};

export type AdminOverviewExpiringPack = {
  memberId: string;
  memberName: string;
  packName: string;
  expiresYmd: string;
  daysLeft: number;
};

export type AdminOverviewWatchItem = {
  id: string;
  variant: "attention" | "info";
  title: string;
  description: string;
  href: string;
};

export type AdminOverviewSnapshot = {
  generatedAt: string;
  todayYmd: string;
  dayLabel: string;
  greetingName: string | null;
  pulse: AdminOverviewPulseCards;
  details: AdminOverviewDetails;
  watchItems: AdminOverviewWatchItem[];
  expiringPacks: AdminOverviewExpiringPack[];
  expiringThisWeek: number;
};
