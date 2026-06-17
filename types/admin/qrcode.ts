export type QrCodeStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type AdminQrCode = {
  publicId: string;
  name: string;
  status: QrCodeStatus;
  assignedMemberId: string | null;
  createdByUserId: string;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  scanUrl: string;
};

export type QrCodeListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  assignedCount: number;
  unassignedCount: number;
};

export type QrCodeFilters = {
  search: string;
  assignment: "ALL" | "ASSIGNED" | "UNASSIGNED";
  page: number;
};

export type QrCodeListResponse = {
  items: AdminQrCode[];
  meta: QrCodeListMeta;
};

export type CreateQrCodePayload = {
  name: string;
  quantity?: number;
  assignedMemberId?: string;
};
