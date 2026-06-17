import { MemberDetailClient } from "@/components/dashboard/member-detail-client";
import { getAdminPacksForForm, getMemberDetailById } from "@/lib/admin/member-detail-server";
import { requireStaff } from "@/lib/auth";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export default async function AdminMemberDetailPage({ params }: Params) {
  await requireStaff();
  const { id } = await params;

  const [member, packs] = await Promise.all([getMemberDetailById(id), getAdminPacksForForm()]);

  if (!member) {
    notFound();
  }

  return (
    <MemberDetailClient key={id} memberId={id} initialMember={member} initialPacks={packs} />
  );
}
