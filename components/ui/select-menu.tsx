"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SelectMenuOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type SelectMenuProps<TValue extends string> = {
  id?: string;
  label?: string;
  value: TValue;
  options: Array<SelectMenuOption<TValue>>;
  onChange: (value: TValue) => void;
  placeholder?: string;
  className?: string;
};

export function SelectMenu<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  className = "",
}: SelectMenuProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`${className}`.trim()}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex h-[42px] w-full items-center justify-between rounded-xl border border-brand-medium/30 bg-white px-4 text-sm text-brand-dark outline-none transition focus:border-brand-dark/60 ${
            label ? "mt-2" : ""
          }`}
        >
          <span className="truncate text-left">
            {selected?.label ?? placeholder ?? "Sélectionner"}
          </span>
          <span className="ml-3 text-brand-dark/50">▾</span>
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-[calc(100%+2px)] z-50 w-full overflow-hidden rounded-xl border border-brand-medium/25 bg-white shadow-lg">
            <div className="max-h-72 overflow-auto py-1">
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm transition ${
                      active ? "bg-brand-light/40 text-brand-dark" : "text-brand-dark/80 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="truncate">{o.label}</span>
                    {active ? <span className="text-brand-dark/60">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

