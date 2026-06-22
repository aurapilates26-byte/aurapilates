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

export const memberEnrollmentFilterSchema = z.enum(["ACTIVE", "DEPOSIT_PENDING", "ALL"]);

export const createMemberSchema = z.object({
  email: optionalEmailPreprocessor,
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(40),
  birthDate: birthDatePreprocessor,
  packId: z.string().trim().cuid(),
  isActive: z.boolean().optional(),
  qrId: optionalQrIdPreprocessor,
  personalDiscount: personalDiscountInputSchema,
  paymentMode: z.enum(["full", "deposit"]).default("full"),
  depositAmountDinars: z.number().int().positive().optional(),
  paymentMethod: z.enum(PACK_PAYMENT_METHODS),
});

export const completeMemberDepositSchema = z.object({
  qrId: optionalQrIdPreprocessor,
  paymentMethod: z.enum(PACK_PAYMENT_METHODS),
});

export const memberStatusFilterSchema = z.enum(["ALL", "ACTIVE", "PENDING", "EXPIRED", "NO_PACK"]);

export const listMembersQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: memberStatusFilterSchema.default("ALL"),
  enrollment: memberEnrollmentFilterSchema.default("ACTIVE"),
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
});

export const renewMemberPackSchema = z.object({
  packId: z.string().trim().cuid(),
});

