"use client";

export function MobileMenuButton() {
  return (
    <button
      type="button"
      aria-label="Ouvrir le menu"
      onClick={() => window.dispatchEvent(new Event("dashboard:open-sidebar"))}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-medium/25 bg-white text-brand-dark shadow-sm transition hover:bg-zinc-50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

