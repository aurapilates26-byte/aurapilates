import { AdminPacksClient } from "@/components/dashboard/admin-packs-client";
import { requireStaff } from "@/lib/auth";

export default async function AdminPacksPage() {
  await requireStaff();

  return <AdminPacksClient />;
}
