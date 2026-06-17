import { AdminReservationsClient } from "@/components/dashboard/admin-reservations-client";
import { requireStaff } from "@/lib/auth";

export default async function AdminReservationsAdminPage() {
  await requireStaff();

  return <AdminReservationsClient />;
}

