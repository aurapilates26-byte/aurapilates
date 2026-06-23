import { AdminCoachesClient } from "@/components/dashboard/admin-coaches-client";
import { requireStaff } from "@/lib/auth";

export default async function AdminCoachsPage() {
  await requireStaff();

  return <AdminCoachesClient />;
}
