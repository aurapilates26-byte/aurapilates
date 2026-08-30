"use client";

import { useEffect, type ReactNode } from "react";

type RightDrawerProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
};

export function RightDrawer({ isOpen, title, description, onClose, children }: RightDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="right-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-brand-medium/20 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-medium/15 px-5 py-4">
          <div className="min-w-0">
            <h2 id="right-drawer-title" className="text-lg font-semibold text-brand-dark">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-brand-dark/70">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-medium/30 bg-white text-brand-dark/80 transition hover:bg-zinc-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  );
}
