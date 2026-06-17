import { AdminOverviewDashboard } from "@/components/dashboard/admin-overview/admin-overview-dashboard";
import { AdminOverviewRefresh } from "@/components/dashboard/admin-overview/admin-overview-refresh";
import type { AdminOverviewSnapshot } from "@/types/admin/overview";

type AdminOverviewProps = {
  data: AdminOverviewSnapshot;
};

export function AdminOverview({ data }: AdminOverviewProps) {
  return (
    <AdminOverviewRefresh>
      <AdminOverviewDashboard data={data} />
    </AdminOverviewRefresh>
  );
}
