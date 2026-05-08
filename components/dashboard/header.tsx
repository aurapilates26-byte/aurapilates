import type { ReactNode } from "react";
import { MobileMenuButton } from "@/components/dashboard/mobile-menu-button";

type DashboardHeaderProps = {
  role: "ADMIN" | "MEMBRE";
  showRoleLine?: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function DashboardHeader({
  role,
  showRoleLine = true,
  eyebrow,
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <header className="-mx-4 mb-6 bg-white px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-2 flex items-center gap-3 lg:mb-0">
            <div className="lg:hidden">
              <MobileMenuButton />
            </div>
            <h1 className={`${eyebrow ? "mt-0" : "mt-0"} text-3xl font-semibold text-brand-dark`}>
              {title}
            </h1>
          </div>
          {eyebrow ? (
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-brand-dark/55">
              {eyebrow}
            </p>
          ) : null}
          {showRoleLine ? (
            <p className="mt-2 text-sm font-medium text-brand-dark/60">
              Connecte en tant que {role === "ADMIN" ? "administrateur" : "membre"}
            </p>
          ) : null}
          {description ? <p className="mt-2 text-sm text-brand-dark/70">{description}</p> : null}
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
