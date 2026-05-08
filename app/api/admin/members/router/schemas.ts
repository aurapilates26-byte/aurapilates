import { z } from "zod";

const birthDatePreprocessor = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return value;
}, z.coerce.date().optional());

export const createMemberSchema = z.object({
  email: z.string().trim().email(),
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(6).max(40).optional(),
  birthDate: birthDatePreprocessor,
  packId: z.string().trim().cuid(),
  isActive: z.boolean().optional(),
  qrId: z.string().trim().min(10),
});

export const listMembersQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const updateMemberSchema = z.object({
  email: z.string().trim().email().optional(),
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(6).max(40).optional(),
  birthDate: birthDatePreprocessor,
  packId: z.string().trim().cuid().optional(),
  isActive: z.boolean().optional(),
  // Allow reassigning QR if needed later
  qrId: z.string().trim().min(10).optional(),
});

