"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DatePickerProps = {
  id?: string;
  label?: string;
  value: string; // ISO date: YYYY-MM-DD or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

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

export function DatePicker({ id, label, value, onChange, placeholder, className = "" }: DatePickerProps) {
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
        onClick={() => {
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
        className={`flex h-[42px] w-full items-center justify-between rounded-xl border border-brand-medium/30 bg-white px-4 text-sm text-brand-dark outline-none transition focus:border-brand-dark/60 ${
          label ? "mt-2" : ""
        }`}
      >
        <span className={`truncate text-left ${labelText ? "" : "text-brand-dark/40"}`}>
          {labelText || placeholder || "jj/mm/aaaa"}
        </span>
        <span className="ml-3 text-brand-dark/50">📅</span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+2px)] z-50 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-brand-medium/25 bg-white shadow-lg">
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
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      onChange(d.iso);
                      setIsOpen(false);
                    }}
                    className={`h-9 rounded-lg text-sm transition ${
                      isSelected
                        ? "bg-brand-dark text-white"
                        : "bg-white text-brand-dark hover:bg-zinc-50"
                    } ${isToday && !isSelected ? "border border-brand-medium/25" : ""}`}
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

