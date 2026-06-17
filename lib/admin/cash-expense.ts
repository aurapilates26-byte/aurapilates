import "server-only";

import type { CashExpense, CashExpenseKind } from "@prisma/client";
import {
  formatYmdPrismaDate,
  parseYmdToPrismaDate,
  prismaDateInclusiveUtcRange,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { localMonthUtcRange } from "@/lib/admin/pack-payment";
import type { CashExpenseDto } from "@/types/admin/cash-expense";

export type CreateCashExpenseInput = {
  kind: CashExpenseKind;
  label: string;
  amountDinars: number;
  expenseDate?: Date;
  note?: string | null;
  recordedByUserId?: string | null;
};

function serializeCashExpense(row: CashExpense): CashExpenseDto {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    amountDinars: row.amountDinars,
    expenseDateYmd: formatYmdPrismaDate(row.expenseDate),
    note: row.note,
  };
}

export async function createCashExpense(input: CreateCashExpenseInput): Promise<CashExpenseDto> {
  const amountDinars = input.amountDinars;
  if (!Number.isInteger(amountDinars) || amountDinars <= 0) {
    throw new Error("Montant invalide");
  }
  const label = input.label.trim();
  if (!label) {
    throw new Error("Libellé requis");
  }

  const row = await prisma.cashExpense.create({
    data: {
      kind: input.kind,
      label,
      amountDinars,
      expenseDate: input.expenseDate ?? startOfLocalToday(),
      note: input.note?.trim() || null,
      recordedByUserId: input.recordedByUserId ?? null,
    },
  });

  return serializeCashExpense(row);
}

export async function sumCashExpensesForMonth(yearMonth: string): Promise<number> {
  const range = localMonthUtcRange(yearMonth);
  if (!range) return 0;

  const agg = await prisma.cashExpense.aggregate({
    where: {
      expenseDate: prismaDateInclusiveUtcRange(range.from, range.to),
    },
    _sum: { amountDinars: true },
  });
  return agg._sum.amountDinars ?? 0;
}

export async function listCashExpensesForMonth(yearMonth: string): Promise<CashExpenseDto[]> {
  const range = localMonthUtcRange(yearMonth);
  if (!range) return [];
  return listCashExpensesForDateRange(range.from, range.to);
}

export async function listCashExpensesForDateRange(from: Date, to: Date): Promise<CashExpenseDto[]> {
  const rows = await prisma.cashExpense.findMany({
    where: {
      expenseDate: prismaDateInclusiveUtcRange(from, to),
    },
    orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
  });

  return rows.map(serializeCashExpense);
}

export function parseExpenseDateYmd(ymd: string): Date | null {
  return parseYmdToPrismaDate(ymd.trim());
}

export function expenseKindLabelFr(kind: CashExpenseKind): string {
  return kind === "FIXED" ? "Fixe" : "Variable";
}
