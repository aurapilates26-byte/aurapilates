import { AdminReservationsClient } from "@/components/dashboard/admin-reservations-client";
import { requireRole } from "@/lib/auth";

export default async function AdminReservationsAdminPage() {
  await requireRole("ADMIN");

  return <AdminReservationsClient />;
}

