import { z } from "zod";
import { PACK_PAYMENT_METHODS } from "@/lib/pack-payment-method";

const birthDatePreprocessor = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return value;
}, z.coerce.date().optional());

const optionalQrIdPreprocessor = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return value;
}, z.string().trim().min(10).optional());

const optionalEmailPreprocessor = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().email().optional());

const personalDiscountInputSchema = z.union([
  z.object({
    type: z.enum(["PERCENT", "AMOUNT"]),
    value: z.number().int().positive(),
    reason: z.string().trim().max(160).optional(),
  }),
  z.null(),
]).optional();

const optionalNotePreprocessor = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().trim().max(2000).optional());

const memberNoteUpdatePreprocessor = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}, z.union([z.string().trim().min(1).max(2000), z.null()]).optional());

export const memberEnrollmentFilterSchema = z.enum(["ACTIVE", "DEPOSIT_PENDING", "ALL"]);

export const memberPaymentStatusFilterSchema = z.enum(["ALL", "PAID", "ADVANCE", "CREDIT"]);

const paymentModeFieldsSchema = z.object({
  /** full = payé · deposit = avance partielle · credit = aucun paiement, total dû */
  paymentMode: z.enum(["full", "deposit", "credit"]).default("full"),
  depositAmountDinars: z.number().int().positive().optional(),
  paymentMethod: z.enum(PACK_PAYMENT_METHODS).optional(),
});

function refinePaymentMode(
  data: z.infer<typeof paymentModeFieldsSchema>,
  ctx: z.RefinementCtx,
  depositPath = "depositAmountDinars",
  methodPath = "paymentMethod",
) {
  if (data.paymentMode === "deposit") {
    if (data.depositAmountDinars == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez le montant de l'acompte.",
        path: [depositPath],
      });
    }
    if (!data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez le moyen de paiement.",
        path: [methodPath],
      });
    }
    return;
  }

  if (data.paymentMode === "full") {
    if (!data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez le moyen de paiement.",
        path: [methodPath],
      });
    }
    if (data.depositAmountDinars != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aucun acompte en paiement complet.",
        path: [depositPath],
      });
    }
    return;
  }

  if (data.depositAmountDinars != null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Aucun paiement en mode crédit.",
      path: [depositPath],
    });
  }
}

export const createMemberSchema = z
  .object({
    email: optionalEmailPreprocessor,
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(6).max(40),
    birthDate: birthDatePreprocessor,
    packId: z.string().trim().cuid(),
    isActive: z.boolean().optional(),
    qrId: optionalQrIdPreprocessor,
    personalDiscount: personalDiscountInputSchema,
    note: optionalNotePreprocessor,
  })
  .merge(paymentModeFieldsSchema)
  .superRefine((data, ctx) => refinePaymentMode(data, ctx));

export const completeMemberDepositSchema = z.object({
  qrId: optionalQrIdPreprocessor,
  paymentMethod: z.enum(PACK_PAYMENT_METHODS),
});

export const memberStatusFilterSchema = z.enum(["ALL", "ACTIVE", "PENDING", "EXPIRED", "NO_PACK"]);

export const listMembersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: memberStatusFilterSchema.default("ALL"),
  enrollment: memberEnrollmentFilterSchema.default("ALL"),
  paymentStatus: memberPaymentStatusFilterSchema.default("ALL"),
  packId: z.string().trim().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(5000).default(20),
});

export const updateMemberSchema = z.object({
  email: optionalEmailPreprocessor,
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(6).max(40).optional(),
  birthDate: birthDatePreprocessor,
  packId: z.string().trim().cuid().optional(),
  isActive: z.boolean().optional(),
  // Allow reassigning QR if needed later
  qrId: z.string().trim().min(10).optional(),
  personalDiscount: personalDiscountInputSchema,
  paymentMethod: z.enum(PACK_PAYMENT_METHODS).optional(),
  note: memberNoteUpdatePreprocessor,
  depositAmountDinars: z.number().int().positive().optional(),
});

export const renewMemberPackSchema = z
  .object({
    packId: z.string().trim().cuid(),
    personalDiscount: personalDiscountInputSchema,
  })
  .merge(paymentModeFieldsSchema)
  .superRefine((data, ctx) => refinePaymentMode(data, ctx));

