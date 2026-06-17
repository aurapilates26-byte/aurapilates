import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { coachPayrollModeSchema, dinarsAmountSchema } from "@/lib/admin/coach-api-schema";
import { isSuperAdminRole } from "@/lib/admin/access";
import { validateActiveCoachPayroll } from "@/lib/coach-payroll-mode";

const db = new PrismaClient();

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z.string().trim().email().optional()
);

function isValidImageUrl(value: string) {
  if (value.startsWith("/coach/")) return true;
  if (value.startsWith("data:image/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalImageSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z
    .string()
    .trim()
    .refine((value) => isValidImageUrl(value), "Image invalide : utilisez une image depuis l'appareil ou une URL valide.")
    .optional()
);

const updateCoachSchema = z.object({
  imageUrl: optionalImageSchema,
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  description: z.string().trim().max(3000).optional(),
  email: optionalEmailSchema,
  phone: z.string().trim().min(6).max(40).optional(),
  payrollMode: coachPayrollModeSchema.optional(),
  sessionCostDinars: dinarsAmountSchema,
  monthlySalaryDinars: dinarsAmountSchema,
  isActive: z.boolean().optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireSuperAdminCoach() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Non autorisé", 401) };
  if (!isSuperAdminRole(session.user.role)) {
    return { error: errorResponse("Accès réservé à la direction", 403) };
  }
  return { session };
}

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSuperAdminCoach();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const coach = await db.coach.findUnique({ where: { id } });
  if (!coach) {
    return errorResponse("Coach introuvable", 404);
  }

  return Response.json({
    item: {
      ...coach,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    },
  });
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireSuperAdminCoach();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const raw = await request.json().catch(() => null);
  const parsed = updateCoachSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.[0];
    const message = field ? `${String(field)} : ${issue.message}` : issue?.message ?? "Données invalides";
    return errorResponse(message, 400);
  }

  const data = parsed.data;
  const payrollMode = data.payrollMode ?? "PER_SESSION";
  const isActive = data.isActive ?? true;
  const payrollError = validateActiveCoachPayroll({
    isActive,
    payrollMode,
    sessionCostDinars: data.sessionCostDinars ?? null,
    monthlySalaryDinars: data.monthlySalaryDinars ?? null,
  });
  if (payrollError) return errorResponse(payrollError, 400);

  try {
    const item = await db.coach.update({
      where: { id },
      data: {
        imageUrl: data.imageUrl ?? null,
        firstName: data.firstName,
        lastName: data.lastName,
        description: data.description ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        payrollMode,
        sessionCostDinars: data.sessionCostDinars ?? null,
        monthlySalaryDinars: data.monthlySalaryDinars ?? null,
        isActive,
      },
    });
    return Response.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Record to update not found")) {
      return errorResponse("Coach introuvable", 404);
    }
    if (message.includes("Unique constraint")) {
      return errorResponse("E-mail déjà utilisé", 409);
    }
    return errorResponse("Impossible de mettre à jour ce coach", 400);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireSuperAdminCoach();
  if ("error" in guard) return guard.error;

  const { id } = await params;

  try {
    await db.coach.delete({
      where: { id },
    });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Record to delete does not exist")) {
      return errorResponse("Coach introuvable", 404);
    }
    return errorResponse("Impossible de supprimer ce coach", 400);
  }
}
