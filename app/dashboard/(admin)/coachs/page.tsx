import { AdminCoachesClient } from "@/components/dashboard/admin-coaches-client";
import { requireSuperAdmin } from "@/lib/auth";

export default async function AdminCoachsPage() {
  await requireSuperAdmin();

  return <AdminCoachesClient />;
}
