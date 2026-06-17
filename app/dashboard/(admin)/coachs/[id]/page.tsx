import { CoachDetailClient } from "@/components/dashboard/coach-detail-client";
import { requireSuperAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export default async function AdminCoachDetailPage({ params }: Params) {
  await requireSuperAdmin();
  const { id } = await params;

  return <CoachDetailClient coachId={id} />;
}
