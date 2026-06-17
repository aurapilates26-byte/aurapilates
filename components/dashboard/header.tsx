"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useDashboardRole } from "@/components/dashboard/dashboard-role-context";
import { staffRoleLabelFr } from "@/lib/admin/access";
import { MobileMenuButton } from "@/components/dashboard/mobile-menu-button";

type DashboardHeaderProps = {
  /** @deprecated Le rôle vient du contexte dashboard (session). */
  role?: "ADMIN" | "MEMBRE" | "SUPER_ADMIN";
  showRoleLine?: boolean;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backLink?: { href: string; label: string };
};

export function DashboardHeader({
  role: roleProp,
  showRoleLine = false,
  eyebrow,
  title,
  description,
  actions,
  backLink,
}: DashboardHeaderProps) {
  const roleFromContext = useDashboardRole();
  const role = roleProp ?? roleFromContext;
  const roleLine =
    role === "MEMBRE" ? "membre" : staffRoleLabelFr(role).toLowerCase();

  return (
    <header className="-mx-4 mb-6 bg-white px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 max-w-5xl">
          {backLink ? (
            <Link
              href={backLink.href}
              className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-sm font-medium text-brand-dark/60 transition hover:bg-zinc-50 hover:text-brand-dark"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
              {backLink.label}
            </Link>
          ) : null}
          <div className="mb-2 flex min-w-0 items-start gap-3 lg:mb-0">
            <div className="shrink-0 lg:hidden">
              <MobileMenuButton />
            </div>
            <div className="min-w-0 flex-1">
              {typeof title === "string" ? (
                <h1 className="min-w-0 text-2xl font-semibold leading-tight text-brand-dark sm:text-3xl">{title}</h1>
              ) : (
                title
              )}
            </div>
          </div>
          {eyebrow ? (
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-brand-dark/55">{eyebrow}</p>
          ) : null}
          {showRoleLine ? (
            <p className="mt-2 text-sm font-medium text-brand-dark/60">
              Connecté en tant que {roleLine}
            </p>
          ) : null}
          {description ? (
            <div className="mt-2 text-sm leading-relaxed text-brand-dark/70 break-words">{description}</div>
          ) : null}
        </div>

        {actions ? (
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 xl:w-auto xl:pt-1">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
