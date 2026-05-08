import { AdminCoachesClient } from "@/components/dashboard/admin-coaches-client";
import { requireRole } from "@/lib/auth";

export default async function AdminCoachsPage() {
  await requireRole("ADMIN");

  return <AdminCoachesClient />;
}
