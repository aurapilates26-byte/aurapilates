import { AdminMembersClient } from "@/components/dashboard/admin-members-client";
import { requireStaff } from "@/lib/auth";

export default async function AdminMembersPage() {
  await requireStaff();

  return <AdminMembersClient />;
}

