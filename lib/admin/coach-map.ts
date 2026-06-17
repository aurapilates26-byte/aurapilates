import type { CoachDetailData } from "@/lib/admin/coach-detail-server";
import type { AdminCoach } from "@/types/admin/coach";

type CoachApiRow = {
  id: string;
  imageUrl: string | null;
  firstName: string;
  lastName: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  payrollMode: AdminCoach["payrollMode"];
  sessionCostDinars: number | null;
  monthlySalaryDinars: number | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function iso(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function adminCoachFromApiRow(row: CoachApiRow): AdminCoach {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    firstName: row.firstName,
    lastName: row.lastName,
    description: row.description,
    email: row.email,
    phone: row.phone,
    payrollMode: row.payrollMode,
    sessionCostDinars: row.sessionCostDinars,
    monthlySalaryDinars: row.monthlySalaryDinars,
    isActive: row.isActive,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function adminCoachFromDetail(detail: CoachDetailData): AdminCoach {
  return {
    id: detail.id,
    imageUrl: detail.imageUrl,
    firstName: detail.firstName,
    lastName: detail.lastName,
    description: detail.description,
    email: detail.email,
    phone: detail.phone,
    payrollMode: detail.payrollMode,
    sessionCostDinars: detail.sessionCostDinars,
    monthlySalaryDinars: detail.monthlySalaryDinars,
    isActive: detail.isActive,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}
