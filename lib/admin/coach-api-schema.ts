import { z } from "zod";
import { validateActiveCoachPayroll } from "@/lib/coach-payroll-mode";

export const dinarsAmountSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : value;
  },
  z.number().int().min(0).max(999_999).nullable().optional(),
);

export const coachPayrollModeSchema = z.enum(["PER_SESSION", "PER_MONTH"]);

export const coachBodySchema = z
  .object({
    imageUrl: z.string().optional(),
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    description: z.string().trim().max(3000).optional(),
    email: z.union([z.string().trim().email(), z.literal("")]).optional(),
    phone: z.string().trim().min(6, "Le numéro de téléphone est requis.").max(40),
    payrollMode: coachPayrollModeSchema.optional(),
    sessionCostDinars: dinarsAmountSchema,
    monthlySalaryDinars: dinarsAmountSchema,
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const payrollMode = data.payrollMode ?? "PER_SESSION";
    const isActive = data.isActive ?? true;
    const msg = validateActiveCoachPayroll({
      isActive,
      payrollMode,
      sessionCostDinars: data.sessionCostDinars ?? null,
      monthlySalaryDinars: data.monthlySalaryDinars ?? null,
    });
    if (msg) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
    }
  });
