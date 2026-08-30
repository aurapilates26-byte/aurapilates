"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MemberBookingRealtime } from "@/components/dashboard/member-booking-realtime";
import { DashboardRoleProvider } from "@/components/dashboard/dashboard-role-context";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import {
  canAccessDashboardPath,
  coachLandingPath,
  staffLandingPath,
  type DashboardRole,
} from "@/lib/admin/access";

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
};

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSidebarOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onOpen = () => setIsSidebarOpen(true);
    window.addEventListener("dashboard:open-sidebar", onOpen as EventListener);
    return () => window.removeEventListener("dashboard:open-sidebar", onOpen as EventListener);
  }, []);

  useEffect(() => {
    if (!canAccessDashboardPath(pathname, role)) {
      const target =
        role === "COACH"
          ? coachLandingPath()
          : role === "MEMBRE"
            ? "/dashboard"
            : staffLandingPath(role);
      router.replace(target);
    }
  }, [pathname, role, router]);

  return (
    <DashboardRoleProvider role={role}>
    <div className="min-h-screen bg-zinc-50 text-brand-dark">
      {role === "MEMBRE" ? <MemberBookingRealtime /> : null}
      <div className="flex min-h-screen w-full">
        <div className="hidden lg:block">
          <DashboardSidebar role={role} variant="desktop" />
        </div>

        {isSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Fermer le menu"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute left-0 top-0 h-full w-[260px]">
              <DashboardSidebar role={role} variant="drawer" onRequestClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 overflow-x-clip px-4 pb-6 pt-0 sm:px-6 lg:px-8 xl:px-10">{children}</main>
        </div>
      </div>
    </div>
    </DashboardRoleProvider>
  );
}
