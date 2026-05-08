"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MemberBookingRealtime } from "@/components/dashboard/member-booking-realtime";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

type DashboardShellProps = {
  role: "ADMIN" | "MEMBRE";
  children: React.ReactNode;
};

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
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

  return (
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

        <div className="flex min-h-screen flex-1 flex-col">
          <main className="flex-1 px-4 pb-6 pt-0 sm:px-6 lg:px-8 xl:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
