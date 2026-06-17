"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DatePickerProps = {
  id?: string;
  label?: string;
  value: string; // ISO date: YYYY-MM-DD or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
};

type MonthPickerProps = {
  id?: string;
  label?: string;
  value: string; // YYYY-MM
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  minYearMonth?: string;
  maxYearMonth?: string;
};

const CALENDAR_POPOVER_CLASS =
  "absolute left-0 top-[calc(100%+2px)] z-50 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-brand-medium/25 bg-white shadow-lg";

const TRIGGER_BTN_CLASS =
  "flex h-[42px] w-full items-center justify-between rounded-xl border border-brand-medium/30 bg-white px-4 text-sm text-brand-dark outline-none transition focus:border-brand-dark/60 disabled:cursor-not-allowed disabled:opacity-60";

const MONTH_NAMES_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

const weekdayLabels = ["lu", "ma", "me", "je", "ve", "sa", "di"] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return null;
  if (monthIndex < 0 || monthIndex > 11) return null;
  if (day < 1 || day > 31) return null;
  return { year, monthIndex, day };
}

function displayFr(value: string) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  return `${pad2(parsed.day)}/${pad2(parsed.monthIndex + 1)}/${parsed.year}`;
}

function monthLabelFr(year: number, monthIndex: number) {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1);
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function mondayIndex(date: Date) {
  // JS: 0=Sunday ... 6=Saturday -> convert to Monday=0 ... Sunday=6
  return (date.getDay() + 6) % 7;
}

function currentYearMonthLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

function parseYearMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

function formatYearMonthFr(value: string) {
  const parsed = parseYearMonth(value);
  if (!parsed) return "";
  return monthLabelFr(parsed.year, parsed.monthIndex);
}

function clampYearMonth(value: string, minYm: string, maxYm: string) {
  if (!parseYearMonth(value)) return maxYm;
  if (value < minYm) return minYm;
  if (value > maxYm) return maxYm;
  return value;
}

function isYearMonthInRange(ym: string, minYm: string, maxYm: string) {
  return ym >= minYm && ym <= maxYm;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  min,
  max,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const parsedValue = useMemo(() => parseIsoDate(value), [value]);
  const today = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth(), day: now.getDate() };
  }, []);

  const [viewYear, setViewYear] = useState(parsedValue?.year ?? today.year);
  const [viewMonthIndex, setViewMonthIndex] = useState(parsedValue?.monthIndex ?? today.monthIndex);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  const monthStart = useMemo(() => startOfMonth(viewYear, viewMonthIndex), [viewMonthIndex, viewYear]);
  const leadingBlanks = useMemo(() => mondayIndex(monthStart), [monthStart]);
  const totalDays = useMemo(() => daysInMonth(viewYear, viewMonthIndex), [viewMonthIndex, viewYear]);

  const days = useMemo(() => {
    const cells: Array<{ day: number; iso: string }> = [];
    for (let d = 1; d <= totalDays; d += 1) {
      cells.push({ day: d, iso: toIsoDate(viewYear, viewMonthIndex, d) });
    }
    return cells;
  }, [totalDays, viewMonthIndex, viewYear]);

  const selectedIso = value;
  const labelText = selectedIso ? displayFr(selectedIso) : "";

  const goPrevMonth = () => {
    const next = new Date(viewYear, viewMonthIndex - 1, 1);
    setViewYear(next.getFullYear());
    setViewMonthIndex(next.getMonth());
  };
  const goNextMonth = () => {
    const next = new Date(viewYear, viewMonthIndex + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonthIndex(next.getMonth());
  };

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => {
            const nextOpen = !prev;
            if (nextOpen) {
              const basis = parsedValue ?? today;
              setViewYear(basis.year);
              setViewMonthIndex(basis.monthIndex);
            }
            return nextOpen;
          });
        }}
        className={`${TRIGGER_BTN_CLASS} ${label ? "mt-2" : ""}`}
      >
        <span className={`truncate text-left ${labelText ? "" : "text-brand-dark/40"}`}>
          {labelText || placeholder || "jj/mm/aaaa"}
        </span>
        <span className="ml-3 shrink-0 text-sky-600" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className={CALENDAR_POPOVER_CLASS}>
          <div className="flex items-center justify-between gap-2 border-b border-brand-medium/15 px-3 py-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-lg border border-brand-medium/25 bg-white px-2 py-1 text-sm text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
            >
              ‹
            </button>
            <div className="min-w-0 flex-1 text-center text-sm font-semibold text-brand-dark">
              {monthLabelFr(viewYear, viewMonthIndex)}
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-lg border border-brand-medium/25 bg-white px-2 py-1 text-sm text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
            >
              ›
            </button>
          </div>

          <div className="px-3 py-2">
            <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-brand-dark/60">
              {weekdayLabels.map((w) => (
                <div key={w} className="text-center">
                  {w}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, idx) => (
                <div key={`b-${idx}`} />
              ))}
              {days.map((d) => {
                const isSelected = d.iso === selectedIso;
                const isToday = d.iso === toIsoDate(today.year, today.monthIndex, today.day);
                const outOfRange = Boolean((min && d.iso < min) || (max && d.iso > max));
                return (
                  <button
                    key={d.iso}
                    type="button"
                    disabled={outOfRange}
                    onClick={() => {
                      onChange(d.iso);
                      setIsOpen(false);
                    }}
                    className={`h-9 rounded-lg text-sm transition ${
                      outOfRange
                        ? "cursor-not-allowed text-brand-dark/25"
                        : isSelected
                          ? "bg-brand-dark text-white"
                          : "bg-white text-brand-dark hover:bg-zinc-50"
                    } ${isToday && !isSelected && !outOfRange ? "border border-brand-medium/25" : ""}`}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-full border border-brand-medium/25 bg-white px-3 py-1 text-xs font-medium text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={() => {
                  const iso = toIsoDate(today.year, today.monthIndex, today.day);
                  onChange(iso);
                  setIsOpen(false);
                }}
                className="rounded-full border border-brand-medium/25 bg-white px-3 py-1 text-xs font-medium text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
              >
                Aujourd&apos;hui
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MonthPicker({
  id,
  label,
  value,
  onChange,
  className = "",
  disabled = false,
  minYearMonth = "1970-01",
  maxYearMonth = currentYearMonthLocal(),
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const parsed = useMemo(() => parseYearMonth(value), [value]);
  const [viewYear, setViewYear] = useState(parsed?.year ?? new Date().getFullYear());

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  const labelText = value ? formatYearMonthFr(value) : "";
  const currentYm = currentYearMonthLocal();

  const goPrevYear = () => {
    const minYear = Number(minYearMonth.slice(0, 4));
    setViewYear((y) => Math.max(minYear, y - 1));
  };
  const goNextYear = () => {
    const maxYear = Number(maxYearMonth.slice(0, 4));
    setViewYear((y) => Math.min(maxYear, y + 1));
  };

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((open) => {
            const next = !open;
            if (next && parsed) setViewYear(parsed.year);
            return next;
          });
        }}
        className={`${TRIGGER_BTN_CLASS} ${label ? "mt-2" : ""}`}
      >
        <span className={`truncate text-left capitalize ${labelText ? "" : "text-brand-dark/40"}`}>
          {labelText || "Choisir un mois"}
        </span>
        <span className="ml-3 shrink-0 text-sky-600" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className={CALENDAR_POPOVER_CLASS}>
          <div className="flex items-center justify-between gap-2 border-b border-brand-medium/15 px-3 py-2">
            <button
              type="button"
              onClick={goPrevYear}
              className="rounded-lg border border-brand-medium/25 bg-white px-2 py-1 text-sm text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
            >
              ‹
            </button>
            <div className="min-w-0 flex-1 text-center text-sm font-semibold text-brand-dark">{viewYear}</div>
            <button
              type="button"
              onClick={goNextYear}
              className="rounded-lg border border-brand-medium/25 bg-white px-2 py-1 text-sm text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3">
            {MONTH_NAMES_FR.map((name, monthIndex) => {
              const ym = `${viewYear}-${pad2(monthIndex + 1)}`;
              const selectable = isYearMonthInRange(ym, minYearMonth, maxYearMonth);
              const isSelected = value === ym;
              const isCurrent = currentYm === ym;
              return (
                <button
                  key={ym}
                  type="button"
                  disabled={!selectable}
                  onClick={() => {
                    onChange(clampYearMonth(ym, minYearMonth, maxYearMonth));
                    setIsOpen(false);
                  }}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                    !selectable
                      ? "cursor-not-allowed text-brand-dark/25"
                      : isSelected
                        ? "bg-brand-dark text-white"
                        : "bg-white text-brand-dark hover:bg-zinc-50"
                  } ${isCurrent && !isSelected && selectable ? "border border-brand-medium/25" : ""}`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-brand-medium/15 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                onChange(clampYearMonth(currentYm, minYearMonth, maxYearMonth));
                setViewYear(Number(currentYm.slice(0, 4)));
                setIsOpen(false);
              }}
              className="rounded-full border border-brand-medium/25 bg-white px-3 py-1 text-xs font-medium text-brand-dark/70 hover:bg-zinc-50 hover:text-brand-dark"
            >
              Mois en cours
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

