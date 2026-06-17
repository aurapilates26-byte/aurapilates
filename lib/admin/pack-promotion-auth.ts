import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole, isSuperAdminRole } from "@/lib/admin/access";

export function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Admin studio ou direction — accès staff standard (sans caisse si ADMIN seul). */
export async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (!isStaffRole(session.user.role)) return { error: errorResponse("Forbidden", 403) };
  return { session };
}

/** Alias historique — même périmètre que requireStaff. */
export async function requireAdmin() {
  return requireStaff();
}

/** Caisse + indicateurs financiers sensibles — direction uniquement. */
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (!isSuperAdminRole(session.user.role)) {
    return { error: errorResponse("Accès réservé à la direction", 403) };
  }
  return { session };
}
