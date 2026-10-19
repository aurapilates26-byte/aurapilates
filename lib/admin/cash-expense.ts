import "server-only";

import { Prisma, type CashExpense, type CashExpenseKind } from "@prisma/client";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdToPrismaDate,
  prismaDateInclusiveUtcRange,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { localMonthUtcRange } from "@/lib/admin/pack-payment";
import {
  isCashExpenseOccurrenceActive,
  monthlyCashExpenseOccurrence,
} from "@/lib/cash-expense-period";
import type { CashExpenseDto } from "@/types/admin/cash-expense";

export type CreateCashExpenseInput = {
  kind: CashExpenseKind;
  label: string;
  amountDinars: number;
  expenseDate?: Date;
  note?: string | null;
  recordedByUserId?: string | null;
};

export type UpdateCashExpenseInput = Omit<CreateCashExpenseInput, "recordedByUserId"> & {
  expenseDate: Date;
  effectiveFrom: Date;
  recordedByUserId?: string | null;
};

function serializeCashExpense(row: CashExpense, occurrenceDate: Date = row.expenseDate): CashExpenseDto {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    amountDinars: row.amountDinars,
    expenseDateYmd: formatYmdPrismaDate(occurrenceDate),
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
      endDate: null,
      note: input.note?.trim() || null,
      recordedByUserId: input.recordedByUserId ?? null,
    },
  });

  return serializeCashExpense(row);
}

export async function updateCashExpense(
  id: string,
  input: UpdateCashExpenseInput,
): Promise<CashExpenseDto | null> {
  if (!Number.isInteger(input.amountDinars) || input.amountDinars <= 0) {
    throw new Error("Montant invalide");
  }
  const label = input.label.trim();
  if (!label) {
    throw new Error("Libellé requis");
  }

  const existing = await prisma.cashExpense.findUnique({
    where: { id },
    select: { kind: true, expenseDate: true, recordedByUserId: true },
  });
  if (!existing) return null;

  const startDate = parseYmdToPrismaDate(formatYmdPrismaDate(existing.expenseDate))!;
  if (
    existing.kind === "FIXED" &&
    input.effectiveFrom.getTime() > startDate.getTime()
  ) {
    const effectiveFromYmd = formatYmdPrismaDate(input.effectiveFrom);
    const [year, month, day] = effectiveFromYmd.split("-").map(Number);
    const previousDay = new Date(Date.UTC(year!, month! - 1, day! - 1));

    const row = await prisma.$transaction(async (tx) => {
      await tx.cashExpense.update({
        where: { id },
        data: { endDate: previousDay },
      });
      return tx.cashExpense.create({
        data: {
          kind: input.kind,
          label,
          amountDinars: input.amountDinars,
          expenseDate: input.expenseDate,
          endDate: null,
          note: input.note?.trim() || null,
          recordedByUserId: input.recordedByUserId ?? existing.recordedByUserId,
        },
      });
    });
    return serializeCashExpense(row);
  }

  try {
    const row = await prisma.cashExpense.update({
      where: { id },
      data: {
        kind: input.kind,
        label,
        amountDinars: input.amountDinars,
        expenseDate: input.expenseDate,
        note: input.note?.trim() || null,
      },
    });
    return serializeCashExpense(row);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return null;
    }
    throw error;
  }
}

export async function deleteCashExpense(id: string): Promise<boolean> {
  const result = await prisma.cashExpense.deleteMany({
    where: { id, kind: "VARIABLE" },
  });
  return result.count > 0;
}

export async function stopCashExpenseRecurrence(id: string, fromDate: Date): Promise<boolean> {
  const expense = await prisma.cashExpense.findUnique({
    where: { id },
    select: { kind: true, expenseDate: true, endDate: true },
  });
  if (!expense) return false;
  if (expense.kind !== "FIXED") return deleteCashExpense(id);

  const fromYmd = formatYmdPrismaDate(fromDate);
  const [year, month, day] = fromYmd.split("-").map(Number);
  const previousDay = new Date(Date.UTC(year!, month! - 1, day! - 1));
  const cutoff =
    expense.endDate && expense.endDate.getTime() < previousDay.getTime()
      ? expense.endDate
      : previousDay;

  if (cutoff.getTime() < expense.expenseDate.getTime()) {
    const result = await prisma.cashExpense.deleteMany({ where: { id, kind: "FIXED" } });
    return result.count > 0;
  }

  try {
    await prisma.cashExpense.update({
      where: { id },
      data: { endDate: cutoff },
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return false;
    }
    throw error;
  }
}

function monthOf(date: Date): { year: number; monthIndex: number } {
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

function addMonths(month: { year: number; monthIndex: number }, count: number) {
  return monthOf(new Date(month.year, month.monthIndex + count, 1));
}

function recurringOccurrenceInMonth(expense: CashExpense, year: number, monthIndex: number): Date {
  const startDate = parseYmdToPrismaDate(formatYmdPrismaDate(expense.expenseDate))!;
  return monthlyCashExpenseOccurrence(startDate, year, monthIndex);
}

function expandRecurringExpenses(
  expenses: CashExpense[],
  from: Date,
  to: Date,
): CashExpenseDto[] {
  const fromMonth = monthOf(from);
  const toMonth = monthOf(to);
  const fromYmd = formatYmdLocal(from);
  const toYmd = formatYmdLocal(to);
  const result: CashExpenseDto[] = [];
  let month = fromMonth;

  while (month.year < toMonth.year || (month.year === toMonth.year && month.monthIndex <= toMonth.monthIndex)) {
    for (const expense of expenses) {
      const occurrenceDate = recurringOccurrenceInMonth(expense, month.year, month.monthIndex);
      const occurrenceYmd = formatYmdPrismaDate(occurrenceDate);
      if (
        occurrenceYmd >= fromYmd &&
        occurrenceYmd <= toYmd &&
        isCashExpenseOccurrenceActive(occurrenceDate, expense.endDate)
      ) {
        result.push(serializeCashExpense(expense, occurrenceDate));
      }
    }
    month = addMonths(month, 1);
  }

  return result;
}

export async function sumCashExpensesForMonth(yearMonth: string): Promise<number> {
  const expenses = await listCashExpensesForMonth(yearMonth);
  return expenses.reduce((sum, expense) => sum + expense.amountDinars, 0);
}

export async function listCashExpensesForMonth(yearMonth: string): Promise<CashExpenseDto[]> {
  const range = localMonthUtcRange(yearMonth);
  if (!range) return [];
  return listCashExpensesForDateRange(range.from, range.to);
}

export async function listCashExpensesForDateRange(from: Date, to: Date): Promise<CashExpenseDto[]> {
  const dateRange = prismaDateInclusiveUtcRange(from, to);
  const [variableExpenses, fixedExpenses] = await Promise.all([
    prisma.cashExpense.findMany({
      where: {
        kind: "VARIABLE",
        expenseDate: dateRange,
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.cashExpense.findMany({
      where: {
        kind: "FIXED",
        expenseDate: { lte: dateRange.lte },
        OR: [{ endDate: null }, { endDate: { gte: dateRange.gte } }],
      },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const recurringOccurrences = expandRecurringExpenses(fixedExpenses, from, to);
  return [...variableExpenses.map((expense) => serializeCashExpense(expense)), ...recurringOccurrences].sort((a, b) =>
    b.expenseDateYmd.localeCompare(a.expenseDateYmd),
  );
}

export function parseExpenseDateYmd(ymd: string): Date | null {
  const normalized = ymd.trim();
  const date = parseYmdToPrismaDate(normalized);
  if (!date || formatYmdPrismaDate(date) !== normalized) return null;
  return date;
}

export function expenseKindLabelFr(kind: CashExpenseKind): string {
  return kind === "FIXED" ? "Fixe" : "Variable";
}
