export function monthlyCashExpenseOccurrence(
  startDate: Date,
  year: number,
  monthIndex: number,
): Date {
  if (startDate.getUTCFullYear() === year && startDate.getUTCMonth() === monthIndex) {
    return new Date(
      Date.UTC(year, monthIndex, startDate.getUTCDate()),
    );
  }

  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, monthIndex, Math.min(startDate.getUTCDate(), lastDay)));
}

export function isCashExpenseOccurrenceActive(occurrenceDate: Date, endDate: Date | null): boolean {
  return endDate == null || occurrenceDate.getTime() <= endDate.getTime();
}
