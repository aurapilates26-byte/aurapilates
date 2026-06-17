import type { UserRole } from "@prisma/client";

/** Rôle tableau de bord (session NextAuth / Prisma UserRole). */
export type DashboardRole = "MEMBRE" | "ADMIN" | "SUPER_ADMIN";

const STAFF_NAV_ALL = [
  { label: "Vue d'ensemble", href: "/dashboard" },
  { label: "Planning", href: "/dashboard/planning" },
  { label: "Réservations", href: "/dashboard/reservations-admin" },
  { label: "Adhérents", href: "/dashboard/adherents" },
  { label: "Packs", href: "/dashboard/packs" },
  { label: "Coachs", href: "/dashboard/coachs" },
  { label: "Présence", href: "/dashboard/presence" },
  { label: "QR code", href: "/dashboard/qr-code" },
  { label: "Caisse", href: "/dashboard/caisse" },
] as const;

const ADMIN_HIDDEN_HREFS = new Set(["/dashboard", "/dashboard/caisse", "/dashboard/coachs"]);

export function parseDashboardRole(role: string | undefined): DashboardRole {
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (role === "ADMIN") return "ADMIN";
  return "MEMBRE";
}

export function isStaffRole(role: string | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdminRole(role: string | undefined): boolean {
  return role === "SUPER_ADMIN";
}

export function staffRoleLabelFr(role: DashboardRole): string {
  if (role === "SUPER_ADMIN") return "Direction";
  if (role === "ADMIN") return "Administrateur";
  return "Membre";
}

export function normalizeDashboardPath(pathname: string): string {
  const p = pathname.split("?")[0] ?? pathname;
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

/** Pages réservées à la direction (SUPER_ADMIN). */
export function isSuperAdminOnlyPath(pathname: string): boolean {
  const path = normalizeDashboardPath(pathname);
  return (
    path === "/dashboard" ||
    path === "/dashboard/caisse" ||
    path.startsWith("/dashboard/caisse/") ||
    path === "/dashboard/coachs" ||
    path.startsWith("/dashboard/coachs/")
  );
}

export function canAccessDashboardPath(pathname: string, role: DashboardRole): boolean {
  const path = normalizeDashboardPath(pathname);
  if (!path.startsWith("/dashboard")) return true;

  if (role === "MEMBRE") return path === "/dashboard";

  if (role === "ADMIN") {
    if (isSuperAdminOnlyPath(path)) return false;
    return true;
  }

  return true;
}

export function staffLandingPath(role: "ADMIN" | "SUPER_ADMIN"): string {
  return role === "ADMIN" ? "/dashboard/planning" : "/dashboard";
}

/** URL cible juste après connexion (évite le passage par /dashboard pour l’admin). */
export function postLoginPath(role: string | undefined): string {
  const parsed = parseDashboardRole(role);
  if (parsed === "ADMIN" || parsed === "SUPER_ADMIN") {
    return staffLandingPath(parsed);
  }
  return "/dashboard";
}

export function getStaffNavigation(role: "ADMIN" | "SUPER_ADMIN") {
  if (role === "SUPER_ADMIN") return [...STAFF_NAV_ALL];
  return STAFF_NAV_ALL.filter((item) => !ADMIN_HIDDEN_HREFS.has(item.href));
}

export function getMemberNavigation() {
  return [{ label: "Vue d'ensemble", href: "/dashboard" }] as const;
}

export type StaffNavItem = (typeof STAFF_NAV_ALL)[number];

export function dashboardRoleFromPrisma(role: UserRole): DashboardRole {
  return parseDashboardRole(role);
}
