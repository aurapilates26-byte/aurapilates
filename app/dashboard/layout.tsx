import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { requireUser } from "@/lib/auth";
import { parseDashboardRole } from "@/lib/admin/access";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await requireUser();
  const role = parseDashboardRole(session.user.role);

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
