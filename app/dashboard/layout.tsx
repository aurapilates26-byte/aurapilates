import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { requireUser } from "@/lib/auth";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await requireUser();
  const role = session.user.role === "ADMIN" ? "ADMIN" : "MEMBRE";

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
