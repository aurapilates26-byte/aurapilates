import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import {
  coachLandingPath,
  isStaffRole,
  isSuperAdminRole,
  parseDashboardRole,
  staffLandingPath,
  type DashboardRole,
} from "@/lib/admin/access";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/connexion");
  }

  return session;
}

export async function requireStaff() {
  const session = await requireUser();
  if (!isStaffRole(session.user.role)) {
    if (parseDashboardRole(session.user.role) === "COACH") {
      redirect(coachLandingPath());
    }
    redirect("/dashboard");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireUser();
  if (!isSuperAdminRole(session.user.role)) {
    redirect(staffLandingPath("ADMIN"));
  }
  return session;
}

export async function requireCoach() {
  const session = await requireUser();
  if (parseDashboardRole(session.user.role) !== "COACH") {
    redirect(coachLandingPath());
  }
  return session;
}

export async function requireRole(expectedRole: DashboardRole) {
  const session = await requireUser();
  const role = parseDashboardRole(session.user.role);

  if (role !== expectedRole) {
    if (role === "COACH") redirect(coachLandingPath());
    if (role === "MEMBRE") redirect("/dashboard");
    redirect(staffLandingPath(role === "ADMIN" || role === "SUPER_ADMIN" ? role : "ADMIN"));
  }

  return session;
}
