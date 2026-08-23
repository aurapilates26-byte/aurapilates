import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { courseLabel } from "@/lib/course-labels";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const { id } = await context.params;
  const prospect = await prisma.sessionProspect.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      courseSlug: true,
      status: true,
    },
  });

  if (!prospect) return errorResponse("Prospect introuvable.", 404);
  if (prospect.status !== "ACTIVE") {
    return errorResponse("Ce prospect a déjà été converti ou clôturé.", 409);
  }

  return Response.json({
    id: prospect.id,
    firstName: prospect.firstName,
    lastName: prospect.lastName,
    phone: prospect.phone,
    courseSlug: prospect.courseSlug,
    courseLabel: courseLabel(prospect.courseSlug),
    status: prospect.status,
  });
}
