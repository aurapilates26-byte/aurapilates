"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/dashboard/logout-button";
import {
  getMemberNavigation,
  getStaffNavigation,
  staffRoleLabelFr,
  type DashboardRole,
} from "@/lib/admin/access";

type DashboardSidebarProps = {
  role: DashboardRole;
  variant?: "desktop" | "drawer";
  onRequestClose?: () => void;
};

type NavItem = { label: string; href: string };

function isNavItemActive(pathname: string, href: string): boolean {
  const normalized = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (href === "/dashboard") {
    return normalized === "/dashboard";
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

function NavIcon({ href, active }: { href: string; active: boolean }) {
  const cls = `h-4 w-4 shrink-0 ${active ? "text-brand-dark" : "text-brand-dark/60"}`;

  if (href === "/dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M4 13.5V20a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1v-6.5" />
        <path d="M3 12l9-8 9 8" />
      </svg>
    );
  }
  if (href === "/dashboard/presence") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <path d="M8.5 7.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 0 0-7 0Z" />
        <path d="M17 8l1.5 1.5L22 6" />
      </svg>
    );
  }
  if (href === "/dashboard/reservations-admin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path d="M8 12h4" />
        <path d="M8 16h7" />
      </svg>
    );
  }
  if (href === "/dashboard/qr-code") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M4 4h6v6H4z" />
        <path d="M14 4h6v6h-6z" />
        <path d="M4 14h6v6H4z" />
        <path d="M14 14h2v2h-2z" />
        <path d="M18 14h2v6h-6v-2h4z" />
        <path d="M14 18h2v2h-2z" />
      </svg>
    );
  }
  if (href === "/dashboard/caisse") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 14h.01" />
        <path d="M10 14h4" />
      </svg>
    );
  }
  if (href === "/dashboard/adherents") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <path d="M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z" />
        <path d="M17 11a3 3 0 1 0-2.8-4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    );
  }
  if (href === "/dashboard/packs") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.3 7L12 12l8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }
  if (href === "/dashboard/coachs") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
      </svg>
    );
  }
  if (href === "/dashboard/planning") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M5 10h14" />
        <path d="M5 14h14" />
        <path d="M5 18h10" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M12 4h9" />
      <path d="M4 9h16" />
      <path d="M4 15h16" />
    </svg>
  );
}

function navigationForRole(role: DashboardRole): NavItem[] {
  if (role === "MEMBRE") return [...getMemberNavigation()];
  return [...getStaffNavigation(role)];
}

export function DashboardSidebar({ role, variant = "desktop", onRequestClose }: DashboardSidebarProps) {
  const navigation = navigationForRole(role);
  const pathname = usePathname();

  const asideClasses =
    variant === "drawer"
      ? "flex h-full w-full flex-col border-r border-brand-medium/20 bg-white shadow-xl"
      : "sticky top-0 flex h-dvh w-[196px] shrink-0 flex-col border-r border-brand-medium/20 bg-white";

  const dashboardTitle =
    role === "MEMBRE" ? "Membre" : role === "SUPER_ADMIN" ? "Direction" : "Admin";

  return (
    <aside className={asideClasses}>
      <div className="border-b border-brand-medium/20 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/65">Aura Pilates</p>
            <h2 className="mt-2 text-lg font-semibold text-brand-dark">Dashboard {dashboardTitle}</h2>
          </div>
          {variant === "drawer" ? (
            <button
              type="button"
              aria-label="Fermer"
              onClick={onRequestClose}
              className="rounded-xl border border-brand-medium/25 bg-white px-3 py-1.5 text-sm font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={() => onRequestClose?.()}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-sidebar-nav-active text-brand-dark shadow-sm ring-1 ring-brand-dark/15"
                  : "text-brand-dark hover:bg-sidebar-nav-hover"
              }`}
            >
              <NavIcon href={item.href} active={active} />
              <span className="min-w-0">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-medium/20 px-3 py-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
