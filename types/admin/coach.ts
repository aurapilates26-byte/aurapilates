import type { CoachPayrollMode } from "@prisma/client";

export type { CoachPayrollMode };

export type AdminCoach = {
  id: string;
  imageUrl: string | null;
  firstName: string;
  lastName: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  payrollMode: CoachPayrollMode;
  /** Coût studio par séance (DT) — si payé par séance. */
  sessionCostDinars: number | null;
  /** Forfait mensuel (DT) — si payé par mois. */
  monthlySalaryDinars: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CoachFilters = {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
};
