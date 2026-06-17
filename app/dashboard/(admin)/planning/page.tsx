import { AdminPlanningClient } from "@/components/dashboard/admin-planning-client";
import { requireStaff } from "@/lib/auth";

export default async function AdminPlanningPage() {
  await requireStaff();
  return <AdminPlanningClient />;
}

