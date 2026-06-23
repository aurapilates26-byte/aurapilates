import { CoachDetailClient } from "@/components/dashboard/coach-detail-client";
import { requireStaff } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export default async function AdminCoachDetailPage({ params }: Params) {
  await requireStaff();
  const { id } = await params;

  return <CoachDetailClient coachId={id} />;
}
