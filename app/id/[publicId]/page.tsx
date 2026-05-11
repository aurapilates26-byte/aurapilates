import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { QrIdVerifyClient } from "@/components/public/qr-id-verify-client";

const db = new PrismaClient();

type Params = {
  params: Promise<{ publicId: string }>;
};

export default async function PublicQrIdPage({ params }: Params) {
  const { publicId: rawPublicId } = await params;

  // Backward-compat: some old QR images may encode `/id/<publicId>.png`.
  if (rawPublicId.toLowerCase().endsWith(".png")) {
    redirect(`/id/${rawPublicId.slice(0, -4)}`);
  }

  const publicId = rawPublicId;

  const item = await db.qrCode.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      assignedMemberId: true,
      status: true,
      assignedMember: { select: { firstName: true, lastName: true } },
    },
  });

  if (!item) {
    return (
      <main className="min-h-dvh bg-zinc-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-brand-dark">QR introuvable</h1>
          <p className="mt-2 text-sm text-brand-dark/70">L’identifiant du QR ne correspond a aucun QR en base.</p>
        </div>
      </main>
    );
  }

  const assignmentStatus = item.assignedMemberId ? "ASSIGNED" : "UNASSIGNED";
  const memberName = item.assignedMember
    ? `${item.assignedMember.firstName ?? ""} ${item.assignedMember.lastName ?? ""}`.trim() || null
    : null;

  return <QrIdVerifyClient publicId={publicId} assignmentStatus={assignmentStatus} memberName={memberName} />;
}

