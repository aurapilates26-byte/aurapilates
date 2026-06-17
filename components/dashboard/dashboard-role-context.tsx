"use client";

import { createContext, useContext } from "react";
import type { DashboardRole } from "@/lib/admin/access";

const DashboardRoleContext = createContext<DashboardRole>("MEMBRE");

export function DashboardRoleProvider({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  return <DashboardRoleContext.Provider value={role}>{children}</DashboardRoleContext.Provider>;
}

export function useDashboardRole() {
  return useContext(DashboardRoleContext);
}
