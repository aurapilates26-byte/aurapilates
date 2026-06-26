import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { listMemberOwnedPacks } from "@/lib/admin/member-owned-packs";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id: memberId } = await params;
  const items = await listMemberOwnedPacks(memberId);
  return Response.json({ items });
}
