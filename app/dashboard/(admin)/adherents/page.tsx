import { AdminMembersClient } from "@/components/dashboard/admin-members-client";
import { requireRole } from "@/lib/auth";

export default async function AdminMembersPage() {
  await requireRole("ADMIN");

  return <AdminMembersClient />;
}

