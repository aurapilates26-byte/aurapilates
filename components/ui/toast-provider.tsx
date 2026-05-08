"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastInput = {
  variant?: ToastVariant;
  title: string;
  description?: string;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  createdAt: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function buildId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function variantClasses(variant: ToastVariant) {
  // Unified toast style requested by product UX:
  // all messages share the same visual treatment as the booking note.
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((input: ToastInput) => {
    const id = buildId();
    const item: ToastItem = {
      id,
      createdAt: Date.now(),
      variant: input.variant ?? "info",
      title: input.title,
      description: input.description,
      durationMs: input.durationMs ?? 3200,
    };

    setToasts((prev) => [item, ...prev].slice(0, 4));

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, item.durationMs);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${variantClasses(t.variant ?? "info")}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                {t.description ? <p className="mt-1 text-xs opacity-80">{t.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="rounded-full px-2 py-1 text-xs font-medium opacity-70 transition hover:opacity-100"
              >
                Fermer
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider />");
  }
  return ctx;
}

