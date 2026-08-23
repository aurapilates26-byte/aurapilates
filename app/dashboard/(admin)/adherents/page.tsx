import { Suspense } from "react";
import { AdminMembersClient } from "@/components/dashboard/admin-members-client";
import { requireStaff } from "@/lib/auth";

export default async function AdminMembersPage() {
  await requireStaff();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-brand-dark/70">Chargement…</div>}>
      <AdminMembersClient />
    </Suspense>
  );
}

