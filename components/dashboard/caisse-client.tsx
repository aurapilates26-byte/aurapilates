"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { packCategoryMenuLabel } from "@/lib/pack-categories";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button, DatePicker, Modal, MonthPicker } from "@/components/ui";
import type { CaisseMonthSnapshot } from "@/types/admin/caisse";
import type {
  CaisseBreakdownRowDto,
  CaisseLedgerEntryDto,
  CaisseLedgerKind,
} from "@/types/admin/caisse-ledger";
import type { CashExpenseDto } from "@/types/admin/cash-expense";
import { formatYmdLocal, parseYmdLocal } from "@/lib/calendar-day";
import {
  CAISSE_HISTORY_MIN_YEAR_MONTH,
  clampHistoryDayInMonth,
  clampHistoryYearMonth,
  currentYearMonthLocal,
  defaultHistoryDayThrough,
  filterLedgerByMonth,
  historyMonthPeriodRange,
  isSelectableHistoryYearMonth,
  listPastHistoryYearMonths,
} from "@/lib/caisse-history-period";
import { useCaisseHistoryStore } from "@/store/admin/caisse-history-store";
import type { CoachPayrollLineDto, CoachSessionDetailDto } from "@/types/admin/coach-payroll";
import type { PackPaymentDto } from "@/types/admin/pack-payment";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { packPaymentMethodLabel } from "@/lib/pack-payment-method";

type CaisseClientProps = {
  initial: CaisseMonthSnapshot;
};

type CaisseContentView = "synthese" | "historique";
type CaisseViewMode = "main" | "expense-form";
type LedgerFilter = "all" | "in" | "out";

function formatDt(amount: number): string {
  const rounded = Math.round(amount * 10) / 10;
  const value = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, "");
  return `${value} DT`;
}

function computeCaisseGlobalKpis(snapshot: CaisseMonthSnapshot) {
  const saleCount = snapshot.payments.length;
  const uniqueMemberCount = new Set(snapshot.payments.map((p) => p.memberId)).size;
  const uniquePackCount = new Set(snapshot.payments.map((p) => p.packId)).size;
  const avgBasketDinars = saleCount > 0 ? Math.round(snapshot.incomeTotalDinars / saleCount) : null;

  const manualVariableDinars = snapshot.expenses
    .filter((e) => e.kind === "VARIABLE")
    .reduce((sum, e) => sum + e.amountDinars, 0);
  const manualFixedDinars = snapshot.expenses
    .filter((e) => e.kind === "FIXED")
    .reduce((sum, e) => sum + e.amountDinars, 0);

  const income = snapshot.incomeTotalDinars;
  const marginPct = income > 0 ? Math.round((snapshot.balanceDinars / income) * 100) : null;
  const chargeRatioPct = income > 0 ? Math.round((snapshot.expenseTotalDinars / income) * 100) : null;

  return {
    saleCount,
    uniqueMemberCount,
    uniquePackCount,
    avgBasketDinars,
    packRevenueDinars: snapshot.incomeTotalDinars,
    totalChargesDinars: snapshot.expenseTotalDinars,
    coachChargesDinars: snapshot.coachPayrollTotalDinars,
    manualChargesDinars: snapshot.manualExpenseTotalDinars,
    manualVariableDinars,
    manualFixedDinars,
    marginPct,
    chargeRatioPct,
    ledgerEntryCount: snapshot.ledger.length,
  };
}

function formatChargesHint(kpis: ReturnType<typeof computeCaisseGlobalKpis>): string {
  if (kpis.totalChargesDinars === 0) return "Aucune charge ce mois";
  const parts: string[] = [];
  if (kpis.coachChargesDinars > 0) {
    parts.push(`Coachs ${formatDt(kpis.coachChargesDinars)}`);
  }
  if (kpis.manualVariableDinars > 0) {
    parts.push(`Variables ${formatDt(kpis.manualVariableDinars)}`);
  }
  if (kpis.manualFixedDinars > 0) {
    parts.push(`Fixes ${formatDt(kpis.manualFixedDinars)}`);
  }
  if (parts.length === 0) {
    return `Charges saisies ${formatDt(kpis.manualChargesDinars)}`;
  }
  return parts.join(" · ");
}

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  const raw = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : yearMonth;
}

function formatYmdFr(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function formatSessionDateLong(ymd: string): string {
  const d = parseYmdLocal(ymd);
  if (!d) return formatYmdFr(ymd);
  const raw = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : formatYmdFr(ymd);
}

type BilledPeriodGroup = {
  periodIndex: number;
  periodLabel: string;
  costDinars: number;
  sessions: CoachSessionDetailDto[];
};

function buildBilledSessionsByPeriod(line: CoachPayrollLineDto): BilledPeriodGroup[] {
  const billed = line.sessionDetails.filter((s) => s.isBilled);
  if (billed.length === 0) return [];

  const periodMeta = new Map(line.periods.map((p) => [p.periodIndex, p]));
  const groups = new Map<number, BilledPeriodGroup>();

  for (const session of billed) {
    let group = groups.get(session.periodIndex);
    if (!group) {
      const meta = periodMeta.get(session.periodIndex);
      group = {
        periodIndex: session.periodIndex,
        periodLabel: meta?.periodLabel ?? session.periodLabel,
        costDinars: meta?.costDinars ?? 0,
        sessions: [],
      };
      groups.set(session.periodIndex, group);
    }
    group.sessions.push(session);
  }

  for (const group of groups.values()) {
    if (!periodMeta.has(group.periodIndex)) {
      group.costDinars = group.sessions.reduce((sum, s) => sum + (s.amountDinars ?? 0), 0);
    }
    group.sessions.sort((a, b) => a.sessionDateYmd.localeCompare(b.sessionDateYmd));
  }

  return [...groups.values()].sort((a, b) => a.periodIndex - b.periodIndex);
}

function CoachBilledSessionCard({ session }: { session: CoachSessionDetailDto }) {
  const presenceLabel =
    session.attendanceCount === 0
      ? "Aucune présence marquée"
      : `${session.attendanceCount} adhérent${session.attendanceCount > 1 ? "s" : ""} présent${session.attendanceCount > 1 ? "s" : ""}`;

  return (
    <li className="rounded-lg border border-brand-medium/12 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-dark">{formatSessionDateLong(session.sessionDateYmd)}</p>
          <p className="mt-0.5 text-xs font-medium text-brand-dark/75">
            {session.startTime} – {session.endTime}
          </p>
          <p className="mt-1 text-xs text-brand-dark/60">{session.courseLabel}</p>
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-amber-900">
          {session.amountDinars != null ? formatDt(session.amountDinars) : "—"}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex rounded-full border border-brand-medium/20 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-brand-dark/70">
          {presenceLabel}
        </span>
        {session.ratePct != null ? (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              session.ratePct === 100
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {session.ratePct === 100 ? "Tarif plein" : "50 % sans présence"}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function formatPackPaymentDateTime(createdAtIso: string, paidAtYmd: string): string {
  const d = new Date(createdAtIso);
  if (Number.isNaN(d.getTime())) return formatYmdFr(paidAtYmd);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortPaymentsByRecordedAt(payments: PackPaymentDto[]): PackPaymentDto[] {
  return [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function installmentSaleKey(p: PackPaymentDto): string | null {
  if (p.packSaleTotalDinars == null) return null;
  if (p.paymentKind !== "DEPOSIT" && p.paymentKind !== "BALANCE") return null;
  return `${p.memberId}:${p.packId}:${p.packSaleTotalDinars}`;
}

type PackRevenueDisplayBlock =
  | { kind: "full"; payment: PackPaymentDto }
  | { kind: "split"; deposit: PackPaymentDto; balance: PackPaymentDto; saleTotal: number }
  | { kind: "installment_single"; payment: PackPaymentDto };

function blockLatestCreatedAt(block: PackRevenueDisplayBlock): string {
  if (block.kind === "split") return block.balance.createdAt;
  return block.payment.createdAt;
}

function buildPackRevenueDisplayBlocks(payments: PackPaymentDto[]): PackRevenueDisplayBlock[] {
  const byKey = new Map<string, PackPaymentDto[]>();
  const fullPayments: PackPaymentDto[] = [];

  for (const p of payments) {
    const key = installmentSaleKey(p);
    if (key) {
      const list = byKey.get(key) ?? [];
      list.push(p);
      byKey.set(key, list);
    } else {
      fullPayments.push(p);
    }
  }

  const blocks: PackRevenueDisplayBlock[] = [];
  const mergedKeys = new Set<string>();

  for (const list of byKey.values()) {
    const deposit = list.find((x) => x.paymentKind === "DEPOSIT");
    const balance = list.find((x) => x.paymentKind === "BALANCE");
    if (deposit && balance && deposit.packSaleTotalDinars != null) {
      const key = installmentSaleKey(deposit)!;
      if (!mergedKeys.has(key)) {
        blocks.push({
          kind: "split",
          deposit,
          balance,
          saleTotal: deposit.packSaleTotalDinars,
        });
        mergedKeys.add(key);
      }
    }
  }

  for (const p of payments) {
    const key = installmentSaleKey(p);
    if (key && mergedKeys.has(key)) continue;
    if (key) {
      blocks.push({ kind: "installment_single", payment: p });
    }
  }

  for (const p of fullPayments) {
    blocks.push({ kind: "full", payment: p });
  }

  return blocks.sort((a, b) => blockLatestCreatedAt(b).localeCompare(blockLatestCreatedAt(a)));
}

function sourceLabel(source: PackPaymentDto["source"]): string {
  return source === "AUTO" ? "Auto" : "Manuel";
}

function expenseKindLabel(kind: CashExpenseDto["kind"]): string {
  return kind === "FIXED" ? "Fixe" : "Variable";
}

function ledgerKindLabelFr(kind: CaisseLedgerKind): string {
  switch (kind) {
    case "INCOME_PACK":
      return "Vente pack";
    case "EXPENSE_COACH_SESSION":
      return "Coach (séance)";
    case "EXPENSE_COACH_MONTHLY":
      return "Coach (mois)";
    case "EXPENSE_MANUAL_FIXED":
      return "Charge fixe";
    case "EXPENSE_MANUAL_VARIABLE":
      return "Charge variable";
  }
}

const CAISSE_HEADER_BTN_SECONDARY =
  "rounded-full border border-brand-medium/30 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60";
const CAISSE_HEADER_BTN_PRIMARY =
  "rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60";

export function CaisseClient({ initial }: CaisseClientProps) {
  const [snapshot, setSnapshot] = useState(initial);
  const [yearMonth, setYearMonth] = useState(() => clampHistoryYearMonth(initial.yearMonth));
  const [monthLoading, setMonthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentView, setContentView] = useState<CaisseContentView>("synthese");
  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("all");
  const historyMonthOptions = useMemo(() => listPastHistoryYearMonths(), []);
  const [historyYearMonth, setHistoryYearMonth] = useState(() =>
    clampHistoryYearMonth(currentYearMonthLocal()),
  );
  const [historyDayThrough, setHistoryDayThrough] = useState(() =>
    defaultHistoryDayThrough(currentYearMonthLocal()),
  );
  const [historyDayCustomized, setHistoryDayCustomized] = useState(false);

  const effectiveHistoryDayThrough = useMemo(() => {
    if (!historyDayCustomized) return defaultHistoryDayThrough(historyYearMonth);
    return clampHistoryDayInMonth(historyYearMonth, historyDayThrough);
  }, [historyYearMonth, historyDayThrough, historyDayCustomized]);

  const handleHistoryMonthChange = useCallback((ym: string) => {
    if (!isSelectableHistoryYearMonth(ym)) return;
    setHistoryYearMonth(ym);
    setHistoryDayThrough(defaultHistoryDayThrough(ym));
    setHistoryDayCustomized(false);
  }, []);

  const handleHistoryDayChange = useCallback((day: number) => {
    const clamped = clampHistoryDayInMonth(historyYearMonth, day);
    const defaultDay = defaultHistoryDayThrough(historyYearMonth);
    setHistoryDayThrough(clamped);
    setHistoryDayCustomized(clamped !== defaultDay);
  }, [historyYearMonth]);

  const resetHistoryFilters = useCallback(() => {
    const ym = currentYearMonthLocal();
    setHistoryYearMonth(ym);
    setHistoryDayThrough(defaultHistoryDayThrough(ym));
    setHistoryDayCustomized(false);
  }, []);

  const fullHistoryLedger = useCaisseHistoryStore((s) => s.fullLedger);
  const historyListLoaded = useCaisseHistoryStore((s) => s.listLoaded);
  const historyStoreLoading = useCaisseHistoryStore((s) => s.isLoading);
  const historyStoreError = useCaisseHistoryStore((s) => s.error);
  const fetchHistory = useCaisseHistoryStore((s) => s.fetchHistory);
  const appendHistoryExpense = useCaisseHistoryStore((s) => s.appendExpense);

  const [caisseViewMode, setCaisseViewMode] = useState<CaisseViewMode>("main");
  const [expenseKind, setExpenseKind] = useState<"FIXED" | "VARIABLE">("VARIABLE");
  const [expenseLabel, setExpenseLabel] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDateYmd, setExpenseDateYmd] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);

  const openExpenseForm = useCallback(() => {
    setCaisseViewMode("expense-form");
    setExpenseKind("VARIABLE");
    setExpenseLabel("");
    setExpenseAmount("");
    setExpenseNote("");
    const today = formatYmdLocal(new Date());
    setExpenseDateYmd(today.startsWith(yearMonth) ? today : `${yearMonth}-01`);
  }, [yearMonth]);

  const closeExpenseForm = useCallback(() => {
    setCaisseViewMode("main");
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const loadMonth = useCallback(async (ym: string) => {
    setMonthLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/caisse?yearMonth=${encodeURIComponent(ym)}`, { cache: "no-store" });
      const data = (await res.json()) as CaisseMonthSnapshot & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible");
      setSnapshot(data);
      setYearMonth(data.yearMonth);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setMonthLoading(false);
    }
  }, []);

  const onMonthChange = (ym: string) => {
    const clamped = clampHistoryYearMonth(ym);
    if (isSelectableHistoryYearMonth(clamped)) void loadMonth(clamped);
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(expenseAmount);
    if (!expenseLabel.trim() || !Number.isFinite(amount) || amount <= 0) return;

    setSavingExpense(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/caisse/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: expenseKind,
          label: expenseLabel.trim(),
          amountDinars: Math.round(amount),
          expenseDateYmd: expenseDateYmd || undefined,
          note: expenseNote.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { item?: CashExpenseDto; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible");

      if (data.item) appendHistoryExpense(data.item);

      setCaisseViewMode("main");
      setExpenseLabel("");
      setExpenseAmount("");
      setExpenseNote("");
      setExpenseDateYmd("");
      await loadMonth(yearMonth);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSavingExpense(false);
    }
  };

  const historyPeriod = useMemo(
    () => historyMonthPeriodRange(historyYearMonth, effectiveHistoryDayThrough),
    [historyYearMonth, effectiveHistoryDayThrough],
  );

  const periodLedger = useMemo(
    () => filterLedgerByMonth(fullHistoryLedger, historyYearMonth, effectiveHistoryDayThrough),
    [fullHistoryLedger, historyYearMonth, effectiveHistoryDayThrough],
  );

  const historyInitialLoading = !historyListLoaded && historyStoreLoading;

  const detailFilteredLedger = useMemo(() => {
    if (ledgerFilter === "in") return periodLedger.filter((e) => e.direction === "in");
    if (ledgerFilter === "out") return periodLedger.filter((e) => e.direction === "out");
    return periodLedger;
  }, [ledgerFilter, periodLedger]);

  const detailLedgerTotals = useMemo(() => {
    let inTotal = 0;
    let outTotal = 0;
    for (const e of detailFilteredLedger) {
      if (e.direction === "in") inTotal += e.amountDinars;
      else outTotal += e.amountDinars;
    }
    return { inTotal, outTotal, count: detailFilteredLedger.length };
  }, [detailFilteredLedger]);

  const globalKpis = useMemo(() => computeCaisseGlobalKpis(snapshot), [snapshot]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHeader
        role="ADMIN"
        showRoleLine={false}
        title="Caisse"
        description={
          caisseViewMode === "expense-form"
            ? "Déclarez une charge (loyer, fournitures, etc.) pour le mois sélectionné."
            : contentView === "historique"
              ? "Journal chronologique des écritures par mois et par jour."
              : "Comptabilité mensuelle : ventes, charges coachs et résultat du mois."
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {caisseViewMode === "expense-form" ? (
              <button
                type="button"
                disabled={monthLoading}
                onClick={closeExpenseForm}
                className={CAISSE_HEADER_BTN_PRIMARY}
              >
                Revenir à la caisse
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={monthLoading}
                  onClick={() =>
                    setContentView(contentView === "historique" ? "synthese" : "historique")
                  }
                  className={CAISSE_HEADER_BTN_SECONDARY}
                >
                  {contentView === "historique" ? "Caisse" : "Historique"}
                </button>
                <button
                  type="button"
                  disabled={monthLoading}
                  onClick={openExpenseForm}
                  className={CAISSE_HEADER_BTN_PRIMARY}
                >
                  + Ajouter une charge
                </button>
              </>
            )}
          </div>
        }
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {caisseViewMode === "expense-form" ? (
        <CaisseExpenseFormCard
          yearMonth={yearMonth}
          expenseKind={expenseKind}
          onExpenseKindChange={setExpenseKind}
          expenseLabel={expenseLabel}
          onExpenseLabelChange={setExpenseLabel}
          expenseAmount={expenseAmount}
          onExpenseAmountChange={setExpenseAmount}
          expenseDateYmd={expenseDateYmd}
          onExpenseDateYmdChange={setExpenseDateYmd}
          expenseNote={expenseNote}
          onExpenseNoteChange={setExpenseNote}
          savingExpense={savingExpense}
          onSubmit={submitExpense}
          onCancel={closeExpenseForm}
        />
      ) : (
        <>
      {contentView === "synthese" ? (
        <>
          <div className="max-w-xs">
            <MonthPicker
              id="caisse-period"
              label="Période"
              value={yearMonth}
              disabled={monthLoading}
              onChange={onMonthChange}
              minYearMonth={CAISSE_HISTORY_MIN_YEAR_MONTH}
            />
          </div>
          {monthLoading ? (
            <p className="-mt-4 text-sm text-brand-dark/65">Mise à jour du mois…</p>
          ) : null}
        </>
      ) : null}

      <section
        className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${
          monthLoading ? "pointer-events-none opacity-60 transition-opacity" : ""
        }`}
      >
        <SummaryCard
          title="Ventes du mois"
          value={String(globalKpis.saleCount)}
          hint={
            globalKpis.saleCount === 0
              ? "Aucune vente enregistrée"
              : `Panier moyen ${formatDt(globalKpis.avgBasketDinars!)} · ${globalKpis.uniqueMemberCount} adhérent${globalKpis.uniqueMemberCount > 1 ? "s" : ""}`
          }
          tone="neutral"
          prominent
        />
        <SummaryCard
          title="Recette packs"
          value={formatDt(globalKpis.packRevenueDinars)}
          hint={
            globalKpis.saleCount === 0
              ? "Aucun encaissement pack"
              : `${globalKpis.saleCount} vente${globalKpis.saleCount > 1 ? "s" : ""} · ${globalKpis.uniquePackCount} pack${globalKpis.uniquePackCount > 1 ? "s" : ""} distinct${globalKpis.uniquePackCount > 1 ? "s" : ""}`
          }
          tone="income"
        />
        <SummaryCard
          title="Charges"
          value={formatDt(globalKpis.totalChargesDinars)}
          hint={formatChargesHint(globalKpis)}
          tone="expense"
        />
        <SummaryCard
          title="Marge nette"
          value={globalKpis.marginPct != null ? `${globalKpis.marginPct} %` : "—"}
          hint={
            globalKpis.marginPct != null
              ? `Charges ${globalKpis.chargeRatioPct}% des entrées · ${globalKpis.ledgerEntryCount} écriture${globalKpis.ledgerEntryCount > 1 ? "s" : ""}`
              : "Pas d'entrées ce mois"
          }
          tone={
            globalKpis.marginPct == null
              ? "neutral"
              : globalKpis.marginPct >= 50
                ? "income"
                : globalKpis.marginPct >= 20
                  ? "balance"
                  : "expense"
          }
        />
      </section>

      {contentView === "synthese" ? (
        <div className={monthLoading ? "pointer-events-none opacity-60 transition-opacity" : undefined}>
          <CaisseSyntheseTab
            snapshot={snapshot}
            onOpenHistorique={() => setContentView("historique")}
            onDeclareCharge={openExpenseForm}
          />
        </div>
      ) : (
        <div>
          <CaisseDetailTab
            historyYearMonth={historyYearMonth}
            historyPeriod={historyPeriod}
            historyLoading={historyInitialLoading}
            historyError={historyStoreError}
            filteredLedger={detailFilteredLedger}
            ledgerFilter={ledgerFilter}
            onLedgerFilterChange={setLedgerFilter}
            ledgerTotals={detailLedgerTotals}
            historyMonthOptions={historyMonthOptions}
            historyDayThrough={effectiveHistoryDayThrough}
            historyMaxDay={historyPeriod.maxDay}
            onHistoryMonthChange={handleHistoryMonthChange}
            onHistoryDayChange={handleHistoryDayChange}
            onResetHistoryFilters={resetHistoryFilters}
          />
        </div>
      )}
        </>
      )}
    </div>
  );
}

function CaisseSyntheseTab({
  snapshot,
  onOpenHistorique,
  onDeclareCharge,
}: {
  snapshot: CaisseMonthSnapshot;
  onOpenHistorique: () => void;
  onDeclareCharge: () => void;
}) {
  return (
    <div className="space-y-5">
      <PackRevenueSection payments={snapshot.payments} totalDinars={snapshot.incomeTotalDinars} />

      <CoachChargesSection
        lines={snapshot.coachPayroll}
        totalDinars={snapshot.coachPayrollTotalDinars}
        sessionCoachCount={snapshot.coachSessionCount}
        monthlyCoachCount={snapshot.coachMonthlyCount}
        billingPeriodLabel={snapshot.planningBillingPeriodLabel}
        periodCoachHint={snapshot.planningPeriodCoachHint}
      />

      <OtherChargesSection
        expenses={snapshot.expenses}
        totalDinars={snapshot.manualExpenseTotalDinars}
        onDeclareCharge={onDeclareCharge}
      />

      <section className="rounded-2xl border border-brand-medium/30 bg-white p-5 shadow-sm ring-1 ring-brand-medium/15 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-medium/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-brand-dark">Résultat du mois</h2>
            <p className="mt-1 text-xs text-brand-dark/60">{formatMonthLabel(snapshot.yearMonth)}</p>
          </div>
          <button
            type="button"
            onClick={onOpenHistorique}
            className="rounded-xl border border-brand-medium/25 px-4 py-2 text-xs font-semibold text-brand-dark/80 transition hover:bg-zinc-50"
          >
            Voir l&apos;historique
          </button>
        </div>

        <CaisseMonthBreakdownTable rows={snapshot.breakdown} balanceDinars={snapshot.balanceDinars} className="mt-5" />
      </section>
    </div>
  );
}

/** Icône refresh (style Heroicons arrow-path). */
function HistoryRefreshIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-brand-dark ${className}`}
      aria-hidden
    >
      <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function HistoryLedgerToolbar({
  filter,
  onFilterChange,
  historyYearMonth,
  historyMonthOptions,
  historyDayThrough,
  historyMaxDay,
  onHistoryMonthChange,
  onHistoryDayChange,
  onResetHistoryFilters,
}: {
  filter: LedgerFilter;
  onFilterChange: (f: LedgerFilter) => void;
  historyYearMonth: string;
  historyMonthOptions: string[];
  historyDayThrough: number;
  historyMaxDay: number;
  onHistoryMonthChange: (yearMonth: string) => void;
  onHistoryDayChange: (day: number) => void;
  onResetHistoryFilters: () => void;
}) {
  const resetTitle = "Revenir au mois et au jour actuels";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <LedgerFilterBar filter={filter} onChange={onFilterChange} />
      <div
        className="flex items-center gap-1.5 rounded-lg border border-brand-medium/20 bg-zinc-50/80 py-0.5 pl-1.5 pr-2 text-xs"
        role="group"
        aria-label="Filtrer par mois et jour"
      >
        <select
          value={historyYearMonth}
          onChange={(e) => onHistoryMonthChange(e.target.value)}
          aria-label="Mois"
          className="max-w-[9.5rem] rounded-md border-0 bg-white py-1.5 pl-2 pr-7 text-xs font-semibold text-brand-dark shadow-sm ring-1 ring-brand-medium/20 focus:outline-none focus:ring-2 focus:ring-brand-medium/35"
        >
          {historyMonthOptions.map((ym) => (
            <option key={ym} value={ym}>
              {formatMonthLabel(ym)}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={historyMaxDay}
          value={historyDayThrough}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= 1) onHistoryDayChange(n);
          }}
          className="w-10 rounded-md border-0 bg-white px-1 py-1.5 text-center text-xs font-semibold tabular-nums text-brand-dark shadow-sm ring-1 ring-brand-medium/20 focus:outline-none focus:ring-2 focus:ring-brand-medium/35"
          aria-label={`Jour du mois (1 à ${historyMaxDay})`}
        />
        <span className="whitespace-nowrap text-brand-dark/50">/ {historyMaxDay} j</span>
        <button
          type="button"
          onClick={onResetHistoryFilters}
          className="ml-1 inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none text-brand-dark"
          aria-label={resetTitle}
          title={resetTitle}
        >
          <HistoryRefreshIcon />
        </button>
      </div>
    </div>
  );
}

function CaisseDetailTab(props: {
  historyYearMonth: string;
  historyPeriod: { fromYmd: string; toYmd: string };
  historyLoading: boolean;
  historyError: string | null;
  filteredLedger: CaisseLedgerEntryDto[];
  ledgerFilter: LedgerFilter;
  onLedgerFilterChange: (f: LedgerFilter) => void;
  ledgerTotals: { inTotal: number; outTotal: number; count: number };
  historyMonthOptions: string[];
  historyDayThrough: number;
  historyMaxDay: number;
  onHistoryMonthChange: (yearMonth: string) => void;
  onHistoryDayChange: (day: number) => void;
  onResetHistoryFilters: () => void;
}) {
  const metaLine = props.historyLoading
    ? "Chargement…"
    : `${props.ledgerTotals.count} ligne${props.ledgerTotals.count > 1 ? "s" : ""}${
        props.ledgerFilter !== "all"
          ? ` · +${formatDt(props.ledgerTotals.inTotal)} / −${formatDt(props.ledgerTotals.outTotal)}`
          : ""
      }`;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-brand-medium/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-brand-dark">Historique</h2>
            <p className="mt-1 text-xs text-brand-dark/60">
              {formatMonthLabel(props.historyYearMonth)} — du {formatYmdFr(props.historyPeriod.fromYmd)} au{" "}
              {formatYmdFr(props.historyPeriod.toYmd)}
              <span className="text-brand-dark/45">
                {" "}
                · {metaLine}
              </span>
            </p>
            {props.historyError ? <p className="mt-1 text-xs text-red-700">{props.historyError}</p> : null}
          </div>
          <HistoryLedgerToolbar
            filter={props.ledgerFilter}
            onFilterChange={props.onLedgerFilterChange}
            historyYearMonth={props.historyYearMonth}
            historyMonthOptions={props.historyMonthOptions}
            historyDayThrough={props.historyDayThrough}
            historyMaxDay={props.historyMaxDay}
            onHistoryMonthChange={props.onHistoryMonthChange}
            onHistoryDayChange={props.onHistoryDayChange}
            onResetHistoryFilters={props.onResetHistoryFilters}
          />
        </div>

        {props.historyLoading ? (
          <p className="mt-6 text-sm text-brand-dark/65">Chargement de l&apos;historique…</p>
        ) : props.filteredLedger.length === 0 ? (
          <p className="mt-6 text-sm text-brand-dark/65">Aucune écriture pour cette période ou ce filtre.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-brand-medium/15 text-left text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2 pr-3">Libellé</th>
                  <th className="pb-2 pr-3">Détail</th>
                  <th className="pb-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {props.filteredLedger.map((entry) => (
                  <LedgerTableRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CaisseExpenseFormCard({
  yearMonth,
  expenseKind,
  onExpenseKindChange,
  expenseLabel,
  onExpenseLabelChange,
  expenseAmount,
  onExpenseAmountChange,
  expenseDateYmd,
  onExpenseDateYmdChange,
  expenseNote,
  onExpenseNoteChange,
  savingExpense,
  onSubmit,
  onCancel,
}: {
  yearMonth: string;
  expenseKind: "FIXED" | "VARIABLE";
  onExpenseKindChange: (k: "FIXED" | "VARIABLE") => void;
  expenseLabel: string;
  onExpenseLabelChange: (v: string) => void;
  expenseAmount: string;
  onExpenseAmountChange: (v: string) => void;
  expenseDateYmd: string;
  onExpenseDateYmdChange: (v: string) => void;
  expenseNote: string;
  onExpenseNoteChange: (v: string) => void;
  savingExpense: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold text-brand-dark">Ajouter une charge</h2>
      <p className="mt-2 text-sm text-brand-dark/70">
        Enregistrez une dépense pour <strong>{formatMonthLabel(yearMonth)}</strong> (loyer, fournitures, etc.). Elle
        apparaîtra dans Autres charges et l&apos;historique du mois.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-brand-dark">Type</span>
          <select
            value={expenseKind}
            onChange={(e) => onExpenseKindChange(e.target.value as "FIXED" | "VARIABLE")}
            className="mt-1 w-full rounded-lg border border-brand-medium/25 bg-white px-3 py-2 text-sm"
          >
            <option value="FIXED">Charge fixe</option>
            <option value="VARIABLE">Charge variable</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-brand-dark">Libellé</span>
          <input
            required
            type="text"
            value={expenseLabel}
            onChange={(e) => onExpenseLabelChange(e.target.value)}
            placeholder="Ex. Loyer studio"
            className="mt-1 w-full rounded-lg border border-brand-medium/25 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-brand-dark">Montant (DT)</span>
          <input
            required
            type="number"
            min={1}
            step={1}
            value={expenseAmount}
            onChange={(e) => onExpenseAmountChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-medium/25 bg-white px-3 py-2 text-sm"
          />
        </label>
        <DatePicker
          id="caisse-expense-date"
          label="Date"
          value={expenseDateYmd}
          onChange={onExpenseDateYmdChange}
          placeholder="JJ/MM/AAAA"
        />
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-brand-dark">Note (optionnel)</span>
          <input
            type="text"
            value={expenseNote}
            onChange={(e) => onExpenseNoteChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-medium/25 bg-white px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={savingExpense}
            className="rounded-full bg-brand-dark px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {savingExpense ? "Enregistrement…" : "Enregistrer la charge"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-brand-medium/30 bg-white px-5 py-2 text-sm font-semibold text-brand-dark transition hover:bg-zinc-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </section>
  );
}

function LedgerTableRow({ entry }: { entry: CaisseLedgerEntryDto }) {
  const isIn = entry.direction === "in";
  return (
    <tr className="border-b border-brand-medium/8 hover:bg-zinc-50/80">
      <td className="py-2.5 pr-3 tabular-nums text-brand-dark/75">{formatYmdFr(entry.dateYmd)}</td>
      <td className="py-2.5 pr-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isIn ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
          }`}
        >
          {ledgerKindLabelFr(entry.kind)}
        </span>
      </td>
      <td className="py-2.5 pr-3 font-medium text-brand-dark">{entry.label}</td>
      <td className="max-w-[200px] truncate py-2.5 pr-3 text-xs text-brand-dark/60" title={entry.detail}>
        {entry.detail}
      </td>
      <td className={`py-2.5 text-right font-semibold tabular-nums ${isIn ? "text-emerald-800" : "text-amber-900"}`}>
        {isIn ? "+" : "−"}
        {formatDt(entry.amountDinars)}
      </td>
    </tr>
  );
}

function LedgerFilterBar({ filter, onChange }: { filter: LedgerFilter; onChange: (f: LedgerFilter) => void }) {
  const opts: { value: LedgerFilter; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "in", label: "Entrées" },
    { value: "out", label: "Charges" },
  ];
  return (
    <div className="flex rounded-lg border border-brand-medium/20 bg-zinc-50/80 p-0.5 text-xs">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 font-semibold transition ${
            filter === o.value ? "bg-white text-brand-dark shadow-sm" : "text-brand-dark/65 hover:text-brand-dark"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PackRevenueSection({ payments, totalDinars }: { payments: PackPaymentDto[]; totalDinars: number }) {
  const blocks = useMemo(() => buildPackRevenueDisplayBlocks(payments), [payments]);
  const saleCount = blocks.length;

  return (
    <section className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-brand-medium/10 pb-4">
        <div>
          <h2 className="text-base font-semibold text-brand-dark">Recette packs</h2>
          <p className="mt-1 text-xs text-brand-dark/55">
            {payments.length} encaissement{payments.length > 1 ? "s" : ""} · {saleCount} vente{saleCount > 1 ? "s" : ""}
            {payments.length > 0 ? ` · total ${formatDt(totalDinars)}` : ""}
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <p className="mt-4 text-sm text-brand-dark/65">Aucune vente ce mois.</p>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] table-fixed text-sm">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-brand-medium/15 text-center text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                  <th className={PACK_REVENUE_CELL}>Adhérent</th>
                  <th className={PACK_REVENUE_CELL}>Pack</th>
                  <th className={PACK_REVENUE_CELL}>Remise</th>
                  <th className={PACK_REVENUE_CELL}>Paiement</th>
                  <th className={PACK_REVENUE_CELL}>Date &amp; heure</th>
                  <th className={PACK_REVENUE_CELL}>Source</th>
                  <th className={PACK_REVENUE_CELL}>Moyen</th>
                  <th className={PACK_REVENUE_CELL}>Montant</th>
                </tr>
              </thead>
              {blocks.map((block) => {
                if (block.kind === "split") {
                  return (
                    <tbody
                      key={`split-${block.deposit.id}-${block.balance.id}`}
                      className="border-b-2 border-brand-medium/15 bg-amber-50/15 shadow-[inset_4px_0_0_0] shadow-amber-300/70"
                    >
                      <tr className="border-b border-amber-200/40 bg-amber-50/45">
                        <td colSpan={8} className="px-5 py-2">
                          <PackRevenueSplitSummary
                            deposit={block.deposit}
                            balance={block.balance}
                            saleTotal={block.saleTotal}
                          />
                        </td>
                      </tr>
                      <PackRevenueTableRow payment={block.deposit} groupVariant="split_deposit" />
                      <PackRevenueTableRow
                        payment={block.balance}
                        groupVariant="split_balance"
                        relatedDeposit={block.deposit}
                      />
                    </tbody>
                  );
                }
                const payment = block.payment;
                return (
                  <tbody key={payment.id} className="border-b border-brand-medium/8">
                    <PackRevenueTableRow payment={payment} />
                  </tbody>
                );
              })}
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {blocks.map((block) => {
              if (block.kind === "split") {
                return (
                  <li
                    key={`split-${block.deposit.id}-${block.balance.id}`}
                    className="overflow-hidden rounded-xl border border-amber-200/70 bg-amber-50/30"
                  >
                    <div className="border-b border-amber-200/50 px-4 py-2.5">
                      <PackRevenueSplitSummary
                        deposit={block.deposit}
                        balance={block.balance}
                        saleTotal={block.saleTotal}
                      />
                    </div>
                    <div className="space-y-0 divide-y divide-amber-200/40">
                      <div className="p-4">
                        <PackRevenueCard payment={block.deposit} embedded relatedDeposit={undefined} stepLabel="1/2" />
                      </div>
                      <div className="border-l-4 border-l-amber-300/80 p-4 pl-3">
                        <PackRevenueCard
                          payment={block.balance}
                          embedded
                          relatedDeposit={block.deposit}
                          stepLabel="2/2"
                        />
                      </div>
                    </div>
                  </li>
                );
              }
              return (
                <li key={block.payment.id}>
                  <PackRevenueCard payment={block.payment} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

const COACH_CHARGE_CELL = "px-2 py-3 align-middle text-center";

function sortCoachPayrollLines(lines: CoachPayrollLineDto[]): CoachPayrollLineDto[] {
  return [...lines].sort((a, b) => {
    if (a.payrollMode !== b.payrollMode) {
      return a.payrollMode === "PER_SESSION" ? -1 : 1;
    }
    return a.coachName.localeCompare(b.coachName, "fr");
  });
}

function CoachPayrollModeBadge({
  mode,
  label,
}: {
  mode: CoachPayrollLineDto["payrollMode"];
  label: string;
}) {
  const className =
    mode === "PER_MONTH"
      ? "inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900"
      : "inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900";
  return <span className={className}>{label}</span>;
}

const COACH_SESSIONS_BADGE_CLASS =
  "inline-flex rounded-full border border-brand-medium/30 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-brand-dark/85 transition";

function CoachSessionsCountBadge({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  const label = `${count} séance${count > 1 ? "s" : ""}`;
  if (!onClick) {
    return <span className={COACH_SESSIONS_BADGE_CLASS}>{label}</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${COACH_SESSIONS_BADGE_CLASS} cursor-pointer hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50`}
      aria-label={`Voir le détail : ${label}`}
    >
      {label}
    </button>
  );
}

function CoachChargeActivityCell({
  line,
  onSessionsDetail,
}: {
  line: CoachPayrollLineDto;
  onSessionsDetail?: () => void;
}) {
  if (line.payrollMode === "PER_MONTH") {
    const prorated =
      line.monthlySalaryDinars > 0 && line.monthlyCostDinars < line.monthlySalaryDinars;
    return (
      <p className="text-xs font-medium text-brand-dark/70">
        {prorated
          ? `Forfait proratisé (${formatDt(line.monthlyCostDinars)} sur ${formatDt(line.monthlySalaryDinars)})`
          : "Forfait mensuel fixe"}
      </p>
    );
  }
  const hasDetail = line.sessionDetails.length > 0;
  return (
    <CoachSessionsCountBadge
      count={line.sessionsInMonth}
      onClick={hasDetail ? onSessionsDetail : undefined}
    />
  );
}

function CoachSessionsDetailModal({
  line,
  onClose,
}: {
  line: CoachPayrollLineDto | null;
  onClose: () => void;
}) {
  if (!line) return null;

  const billedByPeriod = buildBilledSessionsByPeriod(line);
  const upcoming = line.sessionDetails.filter((s) => !s.isBilled);

  return (
    <Modal
      isOpen={line != null}
      title={`Historique facturé — ${line.coachName}`}
      description={`Tarif plein ${formatDt(line.sessionCostDinars)} · 50 % sans présence marquée`}
      panelClassName="max-w-lg"
      onClose={onClose}
    >
      <div className="flex max-h-[min(70vh,520px)] flex-col gap-4">
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-medium/15 bg-zinc-50/80 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/45">Total facturé</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-amber-900">{formatDt(line.monthlyCostDinars)}</p>
          </div>
          <div className="text-right text-xs text-brand-dark/65">
            <p>
              <span className="font-semibold text-brand-dark">{line.sessionsInMonth}</span> séance
              {line.sessionsInMonth > 1 ? "s" : ""} facturée{line.sessionsInMonth > 1 ? "s" : ""}
            </p>
            {line.sessionsUpcomingInMonth > 0 ? (
              <p className="mt-0.5 text-brand-dark/45">
                {line.sessionsUpcomingInMonth} à venir (non facturée{line.sessionsUpcomingInMonth > 1 ? "s" : ""})
              </p>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
        {billedByPeriod.length > 0 ? (
          <div className="space-y-4">
            <h4 className="sticky top-0 z-[1] bg-white pb-1 text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
              Historique par période planning
            </h4>
            {billedByPeriod.map((group) => (
              <section
                key={group.periodIndex}
                className="overflow-hidden rounded-xl border border-brand-medium/15 bg-zinc-50/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-medium/12 bg-white/80 px-3 py-2.5">
                  <p className="text-xs font-semibold text-brand-dark">{group.periodLabel}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-semibold tabular-nums text-sky-900">
                      {group.sessions.length} séance{group.sessions.length > 1 ? "s" : ""}
                    </span>
                    <span className="font-bold tabular-nums text-amber-900">{formatDt(group.costDinars)}</span>
                  </div>
                </div>
                <ul className="space-y-2 p-2">
                  {group.sessions.map((session) => (
                    <CoachBilledSessionCard key={session.id} session={session} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-brand-medium/25 bg-zinc-50/50 px-4 py-6 text-center text-sm text-brand-dark/60">
            Aucune séance facturée pour l&apos;instant. Les charges apparaissent après la fin de chaque créneau.
          </p>
        )}

        {upcoming.length > 0 ? (
          <details className="rounded-xl border border-brand-medium/12 bg-zinc-50/30 px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-brand-dark/55">
              {upcoming.length} séance{upcoming.length > 1 ? "s" : ""} à venir (aperçu)
            </summary>
            <ul className="mt-2 space-y-1.5 pb-1">
              {upcoming.map((session) => (
                <li key={session.id} className="text-[11px] text-brand-dark/45">
                  {formatSessionDateLong(session.sessionDateYmd)} · {session.startTime}–{session.endTime} ·{" "}
                  {session.courseLabel}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        </div>
      </div>
    </Modal>
  );
}

function CoachChargeRateCell({ line }: { line: CoachPayrollLineDto }) {
  if (line.payrollMode === "PER_MONTH") {
    const prorated =
      line.monthlySalaryDinars > 0 && line.monthlyCostDinars < line.monthlySalaryDinars;
    return (
      <p className="text-xs font-medium tabular-nums text-brand-dark/75">
        {formatDt(line.monthlySalaryDinars)}
        <span className="text-brand-dark/50"> / mois contrat</span>
        {prorated ? (
          <span className="mt-0.5 block text-[10px] font-normal text-brand-dark/50">
            Facturé {formatDt(line.monthlyCostDinars)} ce mois
          </span>
        ) : null}
      </p>
    );
  }
  return (
    <p className="text-xs font-medium tabular-nums text-brand-dark/75">
      {formatDt(line.sessionCostDinars)}
      <span className="text-brand-dark/50"> / séance</span>
    </p>
  );
}

function CoachChargeAmountCell({ line }: { line: CoachPayrollLineDto }) {
  return <p className="font-bold tabular-nums text-amber-900">{formatDt(line.monthlyCostDinars)}</p>;
}

function CaisseSectionEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-medium/25 bg-gradient-to-b from-zinc-50/90 to-white px-6 py-10 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-medium/15 bg-white shadow-sm"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-7 w-7 text-brand-dark/35"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 14h6m-5 4h4M7 19h10a2 2 0 0 0 2-2V7.414a2 2 0 0 0-.586-1.414l-4.414-4.414A2 2 0 0 0 11.586 1H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 1v5a1 1 0 0 0 1 1h5" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-semibold text-brand-dark">{title}</p>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-brand-dark/55">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl border border-brand-medium/25 bg-brand-dark px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark/90"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

const OTHER_CHARGE_CELL = "px-2 py-3 align-middle text-center";

function ExpenseKindBadge({ kind }: { kind: CashExpenseDto["kind"] }) {
  const isFixed = kind === "FIXED";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        isFixed
          ? "border-violet-200 bg-violet-50 text-violet-900"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      {expenseKindLabel(kind)}
    </span>
  );
}

function sortOtherCharges(expenses: CashExpenseDto[]): CashExpenseDto[] {
  return [...expenses].sort((a, b) => {
    const byDate = b.expenseDateYmd.localeCompare(a.expenseDateYmd);
    if (byDate !== 0) return byDate;
    return a.label.localeCompare(b.label, "fr");
  });
}

function OtherChargeTableRow({ expense: ex }: { expense: CashExpenseDto }) {
  return (
    <tr className="border-b border-brand-medium/8">
      <td className={`${OTHER_CHARGE_CELL} text-left`}>
        <p className="font-medium text-brand-dark">{ex.label}</p>
        {ex.note ? <p className="mt-0.5 text-[11px] text-brand-dark/55">{ex.note}</p> : null}
      </td>
      <td className={OTHER_CHARGE_CELL}>
        <ExpenseKindBadge kind={ex.kind} />
      </td>
      <td className={`${OTHER_CHARGE_CELL} text-brand-dark/80`}>
        <p className="whitespace-nowrap tabular-nums">{formatYmdFr(ex.expenseDateYmd)}</p>
      </td>
      <td className={OTHER_CHARGE_CELL}>
        <p className="font-bold tabular-nums text-amber-900">{formatDt(ex.amountDinars)}</p>
      </td>
    </tr>
  );
}

function OtherChargeCard({ expense: ex }: { expense: CashExpenseDto }) {
  return (
    <li className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ExpenseKindBadge kind={ex.kind} />
          <p className="mt-2 font-semibold text-brand-dark">{ex.label}</p>
          {ex.note ? <p className="mt-1 text-xs text-brand-dark/60">{ex.note}</p> : null}
        </div>
        <p className="shrink-0 font-bold tabular-nums text-amber-900">{formatDt(ex.amountDinars)}</p>
      </div>
      <p className="mt-2 text-xs text-brand-dark/55">
        <span className="font-semibold uppercase tracking-wide text-brand-dark/45">Date · </span>
        {formatYmdFr(ex.expenseDateYmd)}
      </p>
    </li>
  );
}

function OtherChargesSection({
  expenses,
  totalDinars,
  onDeclareCharge,
}: {
  expenses: CashExpenseDto[];
  totalDinars: number;
  onDeclareCharge: () => void;
}) {
  const sorted = useMemo(() => sortOtherCharges(expenses), [expenses]);
  const fixedCount = expenses.filter((e) => e.kind === "FIXED").length;
  const variableCount = expenses.length - fixedCount;

  return (
    <section className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-brand-medium/10 pb-4">
        <h2 className="text-base font-semibold text-brand-dark">Autres charges</h2>
        <p className="mt-1 text-xs text-brand-dark/55">
          {expenses.length === 0
            ? "Loyer, fournitures et dépenses déclarées du mois — utilisez + Ajouter une charge en haut de page"
            : `${expenses.length} charge${expenses.length > 1 ? "s" : ""} · ${fixedCount} fixe${fixedCount > 1 ? "s" : ""} · ${variableCount} variable${variableCount > 1 ? "s" : ""} · total ${formatDt(totalDinars)}`}
        </p>
      </div>

      {sorted.length === 0 ? (
        <CaisseSectionEmptyState
          title="Aucune charge déclarée"
          description="Les dépenses du studio (loyer, fournitures, etc.) s'affichent ici dès qu'elles sont enregistrées pour ce mois."
          actionLabel="Déclarer une charge"
          onAction={onDeclareCharge}
        />
      ) : (
        <>
          <div className="mt-4 hidden md:block">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[40%]" />
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-brand-medium/15 text-center text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                  <th className={`${OTHER_CHARGE_CELL} text-left`}>Libellé</th>
                  <th className={OTHER_CHARGE_CELL}>Type</th>
                  <th className={OTHER_CHARGE_CELL}>Date</th>
                  <th className={OTHER_CHARGE_CELL}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((ex) => (
                  <OtherChargeTableRow key={ex.id} expense={ex} />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {sorted.map((ex) => (
              <OtherChargeCard key={ex.id} expense={ex} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function CoachChargesSection({
  lines,
  totalDinars,
  sessionCoachCount,
  monthlyCoachCount,
  billingPeriodLabel,
  periodCoachHint,
}: {
  lines: CoachPayrollLineDto[];
  totalDinars: number;
  sessionCoachCount: number;
  monthlyCoachCount: number;
  billingPeriodLabel: string | null;
  periodCoachHint: string | null;
}) {
  const sorted = useMemo(() => sortCoachPayrollLines(lines), [lines]);
  const [sessionsDetailLine, setSessionsDetailLine] = useState<CoachPayrollLineDto | null>(null);

  return (
    <section className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-brand-medium/10 pb-4">
        <div>
          <h2 className="text-base font-semibold text-brand-dark">Charges coachs</h2>
          <p className="mt-1 text-xs text-brand-dark/55">
            {lines.length} coach{lines.length > 1 ? "s" : ""} actif{lines.length > 1 ? "s" : ""}
            {lines.length > 0 ? (
              <>
                {" "}
                · {sessionCoachCount} par séance · {monthlyCoachCount} par mois · total {formatDt(totalDinars)}
              </>
            ) : null}
          </p>
        </div>
        <Link
          href="/dashboard/coachs"
          className="rounded-xl border border-brand-medium/25 px-3 py-1.5 text-xs font-semibold text-brand-dark/80 transition hover:bg-zinc-50"
        >
          Gérer les coachs
        </Link>
      </div>

      <CoachSessionsDetailModal line={sessionsDetailLine} onClose={() => setSessionsDetailLine(null)} />

      {lines.length === 0 ? (
        <div className="mt-4 space-y-2 text-sm text-brand-dark/65">
          <p>Aucune charge coach calculée.</p>
          {periodCoachHint ? (
            <p className="rounded-xl border border-amber-200/70 bg-amber-50/80 px-3 py-2.5 text-brand-dark/80">
              {periodCoachHint}
            </p>
          ) : billingPeriodLabel ? null : (
            <p className="text-brand-dark/55">
              Vérifiez la période planning (Planning → Période) si des cours ont eu lieu ce mois.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] table-fixed text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[26%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-brand-medium/15 text-center text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                  <th className={COACH_CHARGE_CELL}>Coach</th>
                  <th className={COACH_CHARGE_CELL}>Mode</th>
                  <th className={COACH_CHARGE_CELL}>Activité</th>
                  <th className={COACH_CHARGE_CELL}>Tarif</th>
                  <th className={COACH_CHARGE_CELL}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((line) => (
                  <CoachChargeTableRow
                    key={line.coachId}
                    line={line}
                    onSessionsDetail={() => setSessionsDetailLine(line)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {sorted.map((line) => (
              <CoachChargeCard
                key={line.coachId}
                line={line}
                onSessionsDetail={() => setSessionsDetailLine(line)}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function CoachChargeTableRow({
  line,
  onSessionsDetail,
}: {
  line: CoachPayrollLineDto;
  onSessionsDetail: () => void;
}) {
  return (
    <tr className="border-b border-brand-medium/8">
      <td className={COACH_CHARGE_CELL}>
        <Link
          href={`/dashboard/coachs/${line.coachId}`}
          className="inline-block max-w-full break-words font-medium text-brand-dark hover:underline"
        >
          {line.coachName}
        </Link>
      </td>
      <td className={COACH_CHARGE_CELL}>
        <CoachPayrollModeBadge mode={line.payrollMode} label={line.payrollModeLabel} />
      </td>
      <td className={COACH_CHARGE_CELL}>
        <CoachChargeActivityCell line={line} onSessionsDetail={onSessionsDetail} />
      </td>
      <td className={COACH_CHARGE_CELL}>
        <CoachChargeRateCell line={line} />
      </td>
      <td className={COACH_CHARGE_CELL}>
        <CoachChargeAmountCell line={line} />
      </td>
    </tr>
  );
}

function CoachChargeCard({
  line,
  onSessionsDetail,
}: {
  line: CoachPayrollLineDto;
  onSessionsDetail: () => void;
}) {
  return (
    <li className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
        <CoachPayrollModeBadge mode={line.payrollMode} label={line.payrollModeLabel} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-center">
          <Link
            href={`/dashboard/coachs/${line.coachId}`}
            className="font-semibold text-brand-dark hover:underline"
          >
            {line.coachName}
          </Link>
        </div>
        <div className="shrink-0">
          <CoachChargeAmountCell line={line} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <PackRevenueCardField
          label="Activité"
          value={
            <CoachChargeActivityCell line={line} onSessionsDetail={onSessionsDetail} />
          }
          className="col-span-2"
        />
        <PackRevenueCardField label="Tarif" value={<CoachChargeRateCell line={line} />} className="col-span-2" />
      </div>
    </li>
  );
}

const PACK_REVENUE_CELL = "px-2 py-3 align-middle text-center";

/** Vente recréée automatiquement (adhérent avec pack mais sans ligne caisse auparavant). */
function isCatchUpPackPayment(p: PackPaymentDto): boolean {
  return (p.note ?? "").includes("Rattrapage");
}

const PACK_SOURCE_BADGE_CLASS =
  "inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900";

function packSourceBadgeLabel(p: PackPaymentDto): string {
  if (isCatchUpPackPayment(p)) return "Rattrapage";
  return sourceLabel(p.source);
}

function packSourceBadgeTitle(p: PackPaymentDto): string {
  if (isCatchUpPackPayment(p)) {
    return "Adhérent déjà en base sans vente caisse : encaissement ajouté ensuite (rattrapage)";
  }
  if (p.source === "AUTO") {
    return "Vente enregistrée automatiquement à l'inscription ou au renouvellement pack";
  }
  return "Vente saisie manuellement dans la caisse";
}

function packPaymentHasRealDiscount(p: PackPaymentDto): boolean {
  return Boolean(p.promotionLabel) || (p.personalDiscountType != null && p.personalDiscountDinars > 0);
}

function packPaymentDiscountPercent(p: PackPaymentDto): number | null {
  if (p.paymentKind === "DEPOSIT" || p.paymentKind === "BALANCE") return null;
  if (!packPaymentHasRealDiscount(p)) return null;
  if (p.listPriceDinars == null || p.listPriceDinars <= 0) return null;
  if (p.amountDinars >= p.listPriceDinars) return null;
  return Math.round((1 - p.amountDinars / p.listPriceDinars) * 100);
}

function packPaymentInstallmentRemaining(p: PackPaymentDto): number | null {
  if (p.paymentKind !== "DEPOSIT") return null;
  const total = p.packSaleTotalDinars;
  if (total == null || total <= 0) return null;
  return Math.max(0, total - p.amountDinars);
}

const PACK_PROMO_PERCENT_BADGE_CLASS =
  "inline-flex rounded-full border border-amber-300/80 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-950";
const PACK_PERSONAL_DISCOUNT_BADGE_CLASS =
  "inline-flex rounded-full border border-violet-300/80 bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-950";
const PACK_DEPOSIT_BADGE_CLASS =
  "inline-flex rounded-full border border-sky-300/80 bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-950";
const PACK_BALANCE_BADGE_CLASS =
  "inline-flex rounded-full border border-emerald-300/80 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-950";

function PackPromoCell({ payment: p }: { payment: PackPaymentDto }) {
  const hasPromo = Boolean(p.promotionLabel);
  const hasPersonal = p.personalDiscountType != null && p.personalDiscountDinars > 0;
  if (!hasPromo && !hasPersonal) {
    return <span className="text-xs text-brand-dark/35">—</span>;
  }
  const percent = packPaymentDiscountPercent(p);
  return (
    <div className="mx-auto flex max-w-full flex-col items-center gap-1.5 text-center">
      {hasPromo && p.promotionLabel ? (
        <p className="break-words font-semibold text-amber-900">{p.promotionLabel}</p>
      ) : null}
      {hasPersonal ? (
        <div className="flex flex-col items-center gap-1">
          <span className={PACK_PERSONAL_DISCOUNT_BADGE_CLASS}>Remise perso</span>
          <p className="break-words text-xs font-semibold text-brand-dark/75">
            {p.personalDiscountType === "PERCENT" ? `${p.personalDiscountValue}%` : `${p.personalDiscountValue} DT`}
          </p>
        </div>
      ) : null}
      {percent != null ? (
        <span className={PACK_PROMO_PERCENT_BADGE_CLASS}>−{percent} %</span>
      ) : null}
    </div>
  );
}

function PackInstallmentCell({
  payment: p,
  relatedDeposit,
}: {
  payment: PackPaymentDto;
  relatedDeposit?: PackPaymentDto;
}) {
  if (p.paymentKind === "FULL") {
    return <span className="text-xs text-brand-dark/35">—</span>;
  }

  const total = p.packSaleTotalDinars;
  const remaining = packPaymentInstallmentRemaining(p);

  if (p.paymentKind === "DEPOSIT") {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-1.5 text-center">
        <span className={PACK_DEPOSIT_BADGE_CLASS}>Acompte · étape 1/2</span>
        {total != null ? (
          <p className="text-xs text-brand-dark/70">
            Total vente <span className="font-semibold tabular-nums text-brand-dark">{formatDt(total)}</span>
          </p>
        ) : null}
        {remaining != null && remaining > 0 ? (
          <p className="text-xs font-medium text-amber-900/90">
            Reste à payer <span className="font-bold tabular-nums">{formatDt(remaining)}</span>
          </p>
        ) : (
          <p className="text-xs text-brand-dark/55">Solde à finaliser depuis Avances</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-full flex-col items-center gap-1.5 text-center">
      <span className={PACK_BALANCE_BADGE_CLASS}>Solde · étape 2/2</span>
      {relatedDeposit ? (
        <p className="text-xs text-brand-dark/65">
          Suite à l&apos;acompte de {formatDt(relatedDeposit.amountDinars)}
          {relatedDeposit.paymentMethod ? ` (${packPaymentMethodLabel(relatedDeposit.paymentMethod)})` : ""}
        </p>
      ) : null}
      {total != null ? (
        <p className="text-xs text-brand-dark/70">
          Vente complétée <span className="font-semibold tabular-nums text-brand-dark">{formatDt(total)}</span>
        </p>
      ) : null}
    </div>
  );
}

function PackSourceCell({ payment: p }: { payment: PackPaymentDto }) {
  return (
    <span className={PACK_SOURCE_BADGE_CLASS} title={packSourceBadgeTitle(p)}>
      {packSourceBadgeLabel(p)}
    </span>
  );
}

function PackPaymentMethodCell({ payment: p }: { payment: PackPaymentDto }) {
  return <PaymentMethodBadge method={p.paymentMethod} />;
}

function PackAmountCell({ payment: p }: { payment: PackPaymentDto }) {
  if (p.paymentKind === "DEPOSIT" || p.paymentKind === "BALANCE") {
    return (
      <div className="text-center">
        <p className="font-bold tabular-nums text-emerald-800">{formatDt(p.amountDinars)}</p>
        <p className="mt-0.5 text-[11px] font-medium text-brand-dark/55">Encaissé</p>
      </div>
    );
  }

  const list = p.listPriceDinars;
  const discounted = packPaymentHasRealDiscount(p) && list != null && list > p.amountDinars;
  return (
    <div className="text-center">
      {discounted ? (
        <p className="text-xs tabular-nums text-brand-dark/45 line-through">{formatDt(list)}</p>
      ) : null}
      <p className="font-bold tabular-nums text-emerald-800">{formatDt(p.amountDinars)}</p>
    </div>
  );
}

function PackNameCell({ payment: p }: { payment: PackPaymentDto }) {
  const category = packCategoryMenuLabel(p.packCategory);
  return (
    <div className="text-center">
      <span className="font-medium text-brand-dark">{p.packName}</span>
      {category !== "—" ? <p className="mt-0.5 text-xs text-brand-dark/60">{category}</p> : null}
      <PackPaymentManualNote payment={p} />
    </div>
  );
}

function PackPaymentManualNote({ payment: p }: { payment: PackPaymentDto }) {
  if (isCatchUpPackPayment(p) || !p.note?.trim()) return null;
  return <p className="mt-0.5 text-center text-xs text-brand-dark/55">{p.note}</p>;
}

function PackRevenueSplitSummary({ deposit, balance, saleTotal }: { deposit: PackPaymentDto; balance: PackPaymentDto; saleTotal: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-dark/80">
      <span className="inline-flex rounded-full border border-amber-300/80 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
        Vente en 2 fois
      </span>
      <span>
        {deposit.memberName} · {deposit.packName} · Total{" "}
        <span className="font-semibold tabular-nums text-brand-dark">{formatDt(saleTotal)}</span>
      </span>
      <span className="text-brand-dark/60">
        ({formatDt(deposit.amountDinars)}
        {deposit.paymentMethod ? ` ${packPaymentMethodLabel(deposit.paymentMethod)}` : ""} + {formatDt(balance.amountDinars)}
        {balance.paymentMethod ? ` ${packPaymentMethodLabel(balance.paymentMethod)}` : ""})
      </span>
    </div>
  );
}

function PackRevenueTableRow({
  payment: p,
  groupVariant,
  relatedDeposit,
}: {
  payment: PackPaymentDto;
  groupVariant?: "split_deposit" | "split_balance";
  relatedDeposit?: PackPaymentDto;
}) {
  const rowClass =
    groupVariant === "split_deposit"
      ? "border-b border-dashed border-amber-200/55 bg-amber-50/20"
      : groupVariant === "split_balance"
        ? "bg-amber-50/10"
        : "border-b border-brand-medium/8";

  return (
    <tr className={rowClass}>
      <td className={PACK_REVENUE_CELL}>
        {groupVariant === "split_balance" ? (
          <p className="text-xs font-medium text-amber-900/75">↳ Étape 2</p>
        ) : (
          <Link
            href={`/dashboard/adherents/${p.memberId}`}
            className="inline-block max-w-full break-words font-medium text-brand-dark hover:underline"
          >
            {p.memberName}
          </Link>
        )}
      </td>
      <td className={`${PACK_REVENUE_CELL} text-brand-dark/85`}>
        <PackNameCell payment={p} />
      </td>
      <td className={PACK_REVENUE_CELL}>
        <PackPromoCell payment={p} />
      </td>
      <td className={PACK_REVENUE_CELL}>
        <PackInstallmentCell payment={p} relatedDeposit={relatedDeposit} />
      </td>
      <td className={`${PACK_REVENUE_CELL} text-brand-dark/80`}>
        <p className="whitespace-nowrap tabular-nums">{formatPackPaymentDateTime(p.createdAt, p.paidAtYmd)}</p>
        <p className="mt-0.5 text-[11px] text-brand-dark/50">Vente du {formatYmdFr(p.paidAtYmd)}</p>
      </td>
      <td className={PACK_REVENUE_CELL}>
        <PackSourceCell payment={p} />
      </td>
      <td className={PACK_REVENUE_CELL}>
        <PackPaymentMethodCell payment={p} />
      </td>
      <td className={PACK_REVENUE_CELL}>
        <PackAmountCell payment={p} />
      </td>
    </tr>
  );
}

function PackRevenueCard({
  payment: p,
  embedded = false,
  relatedDeposit,
  stepLabel,
}: {
  payment: PackPaymentDto;
  embedded?: boolean;
  relatedDeposit?: PackPaymentDto;
  stepLabel?: string;
}) {
  const hasDiscount = packPaymentHasRealDiscount(p);
  const hasInstallment = p.paymentKind === "DEPOSIT" || p.paymentKind === "BALANCE";

  return (
    <div className={embedded ? undefined : "rounded-xl border border-brand-medium/15 bg-zinc-50/60 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {!embedded ? (
            <Link href={`/dashboard/adherents/${p.memberId}`} className="font-semibold text-brand-dark hover:underline">
              {p.memberName}
            </Link>
          ) : stepLabel ? (
            <p className="text-xs font-semibold text-amber-900/80">Étape {stepLabel}</p>
          ) : null}
          <div className={embedded ? undefined : "mt-2"}>
            <PackNameCell payment={p} />
          </div>
        </div>
        <div className="shrink-0">
          <PackAmountCell payment={p} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <PackRevenueCardField
          label="Remise"
          value={
            hasDiscount ? (
              <PackPromoCell payment={p} />
            ) : (
              <span className="text-brand-dark/35">—</span>
            )
          }
        />
        <PackRevenueCardField
          label="Paiement"
          value={
            hasInstallment ? (
              <PackInstallmentCell payment={p} relatedDeposit={relatedDeposit} />
            ) : (
              <span className="text-brand-dark/35">Complet</span>
            )
          }
        />
        <PackRevenueCardField label="Source" value={<PackSourceCell payment={p} />} />
        <PackRevenueCardField label="Moyen" value={<PackPaymentMethodCell payment={p} />} />
        <PackRevenueCardField label="Date vente" value={formatYmdFr(p.paidAtYmd)} />
        <PackRevenueCardField
          label="Enregistré"
          value={formatPackPaymentDateTime(p.createdAt, p.paidAtYmd)}
          className="col-span-2"
        />
      </div>
    </div>
  );
}

function PackRevenueCardField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-semibold uppercase tracking-wide text-brand-dark/45">{label}</p>
      <div className="mt-0.5 font-medium text-brand-dark/80">{value}</div>
    </div>
  );
}

function CaisseMonthBreakdownTable({
  rows,
  balanceDinars,
  className = "",
}: {
  rows: CaisseBreakdownRowDto[];
  balanceDinars: number;
  className?: string;
}) {
  const mainRows = rows.filter((r) => !r.label.startsWith("↳"));

  return (
    <div className={className}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-medium/15 text-left text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
            <th className="pb-2 pr-4">Poste</th>
            <th className="pb-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {mainRows.map((row) => (
            <tr key={row.key} className="border-b border-brand-medium/8">
              <td className="py-2.5 pr-4 text-brand-dark">{row.label}</td>
              <td
                className={`py-2.5 text-right font-semibold tabular-nums ${
                  row.kind === "income" ? "text-emerald-800" : "text-amber-900"
                }`}
              >
                {row.kind === "income" ? "+" : "−"}
                {formatDt(row.amountDinars)}
              </td>
            </tr>
          ))}
          <tr className="font-bold text-brand-dark">
            <td className="pt-3">Solde</td>
            <td
              className={`pt-3 text-right tabular-nums ${
                balanceDinars >= 0 ? "text-emerald-800" : "text-amber-900"
              }`}
            >
              {balanceDinars >= 0 ? "+" : "−"}
              {formatDt(Math.abs(balanceDinars))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  hint,
  tone,
  prominent,
}: {
  title: string;
  value: string;
  hint: string;
  tone?: "income" | "expense" | "balance" | "neutral";
  /** Met en avant la carte la plus importante (ventes). */
  prominent?: boolean;
}) {
  const valueClass =
    tone === "income"
      ? "text-emerald-800"
      : tone === "expense"
        ? "text-amber-900"
        : tone === "balance"
          ? "text-brand-dark"
          : "text-brand-dark";

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
        prominent ? "border-brand-medium/35 ring-1 ring-brand-medium/15 lg:col-span-1" : "border-brand-medium/20"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark/50">{title}</p>
      <p className={`mt-2 font-bold tabular-nums ${prominent ? "text-3xl" : "text-2xl"} ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs leading-snug text-brand-dark/60">{hint}</p>
    </article>
  );
}


