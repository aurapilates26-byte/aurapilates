import { CoachSpaceClient } from "@/components/dashboard/coach-space-client";
import { requireCoach } from "@/lib/auth";

export default async function CoachDashboardPage() {
  await requireCoach();
  return <CoachSpaceClient />;
}
