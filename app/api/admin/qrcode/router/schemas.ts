import { z } from "zod";

const qrCodeStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);
const qrCodeAssignmentSchema = z.enum(["ASSIGNED", "UNASSIGNED"]);

export const createQrCodeSchema = z.object({
  name: z.string().trim().min(3).max(120),
  quantity: z.number().int().min(1).max(100).default(1),
  assignedMemberId: z.union([z.string().trim().cuid(), z.null()]).optional(),
});

export const updateQrCodeSchema = createQrCodeSchema.partial().extend({
  status: qrCodeStatusSchema.optional(),
});

export const listQrCodeQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: qrCodeStatusSchema.optional(),
  assignment: qrCodeAssignmentSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

/** Export ZIP: same filters as the list, without pagination (capped server-side). */
export const downloadQrCodeQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: qrCodeStatusSchema.optional(),
  assignment: z.enum(["ALL", "ASSIGNED", "UNASSIGNED"]).default("ALL"),
});
