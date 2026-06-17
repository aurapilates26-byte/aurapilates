import { CaisseClient } from "@/components/dashboard/caisse-client";
import { currentYearMonth, fetchCaisseMonthSnapshot } from "@/lib/admin/caisse-summary";
import { requireSuperAdmin } from "@/lib/auth";

export default async function AdminCaissePage() {
  await requireSuperAdmin();
  const initial = await fetchCaisseMonthSnapshot(currentYearMonth());

  return <CaisseClient initial={initial} />;
}
