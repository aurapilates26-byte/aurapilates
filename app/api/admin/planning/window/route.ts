import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";

const db = new PrismaClient();

const bookingWindowSchema = z.enum(["WEEKLY", "FIFTEEN_DAYS", "ONE_MONTH"]);

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (session.user.role !== "ADMIN") return { error: errorResponse("Forbidden", 403) };
  return { session };
}

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const firstPlanning = await db.planning.findFirst({
    select: { bookingWindow: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    bookingWindow: firstPlanning?.bookingWindow ?? "WEEKLY",
  });
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const parsed = z.object({ bookingWindow: bookingWindowSchema }).safeParse(raw);
  if (!parsed.success) return errorResponse("Invalid request payload", 400);

  const { bookingWindow } = parsed.data;

  await db.planning.updateMany({
    data: { bookingWindow },
  });

  return Response.json({ ok: true, bookingWindow });
}
