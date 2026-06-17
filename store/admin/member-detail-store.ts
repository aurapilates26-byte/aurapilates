import { create } from "zustand";
import type { MemberDetailData, PackFormItem } from "@/lib/admin/member-detail-server";

type ListMemberPreview = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  pack: { id: string; name: string; durationDays: string | null } | null;
  packStartedAt: string | null;
  packExpiresAt: string | null;
  personalDiscount: { type: "PERCENT" | "AMOUNT"; value: number; reason: string | null } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  qrCode: { qrId: string; qrKey: string | null; status: string; updatedAt: string } | null;
};

type MemberDetailStoreState = {
  previews: Record<string, MemberDetailData>;
  packs: PackFormItem[] | null;
  setPreviewFromList: (item: ListMemberPreview) => void;
  setPacks: (packs: PackFormItem[]) => void;
  setCachedDetail: (member: MemberDetailData) => void;
  getPreview: (id: string) => MemberDetailData | undefined;
};

function listItemToDetail(item: ListMemberPreview): MemberDetailData {
  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    phone: item.phone,
    email: item.email,
    birthDate: item.birthDate,
    pack: item.pack,
    packStartedAt: item.packStartedAt,
    packExpiresAt: item.packExpiresAt,
    packRemainingSessions: 0,
    packPaymentMethod: null,
    depositPaymentMethod: null,
    pendingPacks: [],
    personalDiscount: item.personalDiscount,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    qrCode: item.qrCode,
  };
}

export const useMemberDetailStore = create<MemberDetailStoreState>((set, get) => ({
  previews: {},
  packs: null,
  setPreviewFromList: (item) =>
    set((state) => ({
      previews: { ...state.previews, [item.id]: listItemToDetail(item) },
    })),
  setPacks: (packs) => set({ packs }),
  setCachedDetail: (member) =>
    set((state) => ({
      previews: { ...state.previews, [member.id]: member },
    })),
  getPreview: (id) => get().previews[id],
}));
