import { AdminPlanningClient } from "@/components/dashboard/admin-planning-client";
import { requireRole } from "@/lib/auth";

export default async function AdminPlanningPage() {
  await requireRole("ADMIN");
  return <AdminPlanningClient />;
}

