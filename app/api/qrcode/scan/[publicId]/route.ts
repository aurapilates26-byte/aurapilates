import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Params = {
  params: Promise<{ publicId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { publicId } = await params;

  const item = await db.qrCode.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      assignedMemberId: true,
      status: true,
    },
  });

  if (!item) {
    return Response.json({ error: "QR code not found" }, { status: 404 });
  }

  const assignmentStatus = item.assignedMemberId ? "ASSIGNED" : "UNASSIGNED";

  // Public scan never exposes qrKey or member data.
  return Response.json({
    qrId: item.publicId,
    assignmentStatus,
    status: item.status,
  });
}

