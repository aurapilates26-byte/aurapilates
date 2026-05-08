import { AdminPacksClient } from "@/components/dashboard/admin-packs-client";
import { requireRole } from "@/lib/auth";

export default async function AdminPacksPage() {
  await requireRole("ADMIN");

  return <AdminPacksClient />;
}
