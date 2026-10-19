import assert from "node:assert/strict";
import test from "node:test";
import {
  isCashExpenseOccurrenceActive,
  monthlyCashExpenseOccurrence,
} from "./cash-expense-period";

test("fixed expense repeats on its original day in later months", () => {
  const startDate = new Date(Date.UTC(2026, 9, 1));

  assert.equal(
    monthlyCashExpenseOccurrence(startDate, 2026, 9).toISOString().slice(0, 10),
    "2026-10-01",
  );
  assert.equal(
    monthlyCashExpenseOccurrence(startDate, 2026, 10).toISOString().slice(0, 10),
    "2026-11-01",
  );
});

test("fixed expense clamps short months without shifting its monthly anchor", () => {
  const startDate = new Date(Date.UTC(2026, 0, 31));

  assert.equal(
    monthlyCashExpenseOccurrence(startDate, 2026, 1).toISOString().slice(0, 10),
    "2026-02-28",
  );
  assert.equal(
    monthlyCashExpenseOccurrence(startDate, 2026, 2).toISOString().slice(0, 10),
    "2026-03-31",
  );
});

test("fixed expense end date is inclusive", () => {
  const occurrence = new Date(Date.UTC(2026, 10, 1));

  assert.equal(
    isCashExpenseOccurrenceActive(occurrence, new Date(Date.UTC(2026, 10, 1))),
    true,
  );
  assert.equal(
    isCashExpenseOccurrenceActive(occurrence, new Date(Date.UTC(2026, 9, 31))),
    false,
  );
});
