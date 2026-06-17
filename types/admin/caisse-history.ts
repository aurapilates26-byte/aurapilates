import type { CaisseLedgerEntryDto } from "@/types/admin/caisse-ledger";

export type CaisseHistoryPeriod = {
  days: number;
  fromYmd: string;
  toYmd: string;
  ledger: CaisseLedgerEntryDto[];
};
