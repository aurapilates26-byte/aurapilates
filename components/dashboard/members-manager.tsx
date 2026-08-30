"use client";

import Link from "next/link";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, SelectMenu } from "@/components/ui";
import { MemberDepositCompleteDialog } from "@/components/dashboard/member-deposit-complete-dialog";
import {
  MEMBER_PAYMENT_STATUS_LABELS,
  memberPaymentRemainingBadgeLabel,
  type MemberPaymentStatus,
} from "@/lib/admin/member-payment-status";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory } from "@/lib/pack-categories";
import {
  PACK_PAYMENT_METHODS,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";
import { ListPageSummary, ListPagination } from "@/components/dashboard/list-pagination";
import { MemberPackStateCards } from "@/components/dashboard/member-pack-state-cards";
import {
  MEMBER_PRIMARY_PACK_KIND_LABELS,
  memberPrimaryPackBadgeClass,
  type MemberPackStateFilter,
  type MemberPrimaryPackKind,
  type MemberPrimaryPackStateCounts,
  emptyMemberPrimaryPackStateCounts,
} from "@/lib/member-primary-pack-state";
import {
  formatPackSelectOptionLabel,
  sortPacksBySessionAsc,
} from "@/lib/public-pack-display";
import { computePersonalDiscountPreviewFromForm } from "@/lib/member-personal-discount";
import type { PackDisplayPricing } from "@/lib/pack-pricing";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

const MEMBERS_PAGE_SIZE = 20;
const MEMBERS_FETCH_PAGE_SIZE = 5000;

function MemberProspectTrialBadge() {
  return (
    <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-900">
      Prospect
    </span>
  );
}

function memberMatchesSearch(member: MemberItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const firstName = (member.firstName ?? "").toLowerCase();
  const lastName = (member.lastName ?? "").toLowerCase();
  const phone = (member.phone ?? "").toLowerCase();
  const email = (member.email ?? "").toLowerCase();
  const fullName = `${firstName} ${lastName}`.trim();
  return (
    firstName.includes(q) ||
    lastName.includes(q) ||
    fullName.includes(q) ||
    phone.includes(q) ||
    email.includes(q)
  );
}

function sortMembersByCreatedAtDesc(members: MemberItem[]): MemberItem[] {
  return [...members].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function formatMemberCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function MemberPackCell({
  memberId,
  packName,
  packStates,
}: {
  memberId: string;
  packName: string | null | undefined;
  packStates: Record<string, MemberPrimaryPackKind>;
}) {
  const kind = packStates[memberId] ?? "none";
  return (
    <div className="flex flex-col items-center gap-1">
      <span>{packName ?? "—"}</span>
      {kind !== "none" ? (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${memberPrimaryPackBadgeClass(kind)}`}
        >
          {MEMBER_PRIMARY_PACK_KIND_LABELS[kind]}
        </span>
      ) : null}
    </div>
  );
}

const memberDetailLinkClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-white text-brand-dark/80 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30";

const iconActionButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2";

function EditMemberButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Modifier l'adhérente"
      title="Modifier"
      className={`${iconActionButtonClass} border-brand-medium/30 bg-white text-brand-dark/80 hover:bg-zinc-50 focus-visible:ring-brand-medium/30`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
    </button>
  );
}

function DeleteMemberButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Supprimer l'adhérente"
      title="Supprimer"
      className={`${iconActionButtonClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-200`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
      </svg>
    </button>
  );
}

function FinalizeDepositButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Finaliser l'acompte"
      title="Finaliser"
      className={`${iconActionButtonClass} border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus-visible:ring-emerald-200`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </button>
  );
}

function DepositAmountCell({
  amount,
  method,
  align = "center",
}: {
  amount: number;
  method: "CASH" | "CHECK" | "TPE" | null | undefined;
  align?: "center" | "start";
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${align === "start" ? "items-start" : "items-center"}`}
    >
      <span className="font-semibold tabular-nums text-brand-dark">{amount} DT</span>
      <PaymentMethodBadge method={method} />
    </div>
  );
}

import { MemberCreateFormPanel } from "@/components/dashboard/member-form/member-create-form-panel";
import { PaymentMethodPicker } from "@/components/dashboard/member-form/payment-method-picker";
import type { ProspectConversionContext } from "@/components/dashboard/reservations/prospect-types";

function DepositProgressBar({
  paid,
  total,
}: {
  paid: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(100, Math.round((paid / safeTotal) * 100));
  return (
    <div className="space-y-1">
      <svg
        viewBox="0 0 100 6"
        className="h-1.5 w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect width="100" height="6" rx="3" className="fill-amber-100" />
        <rect width={percent} height="6" rx="3" className="fill-amber-500" />
      </svg>
      <p className="text-[11px] text-brand-dark/60">
        {paid} / {total} DT encaissés ({percent}%)
      </p>
    </div>
  );
}

function MemberDetailLink({ memberId }: { memberId: string }) {
  return (
    <Link
      href={`/dashboard/adherents/${memberId}`}
      aria-label="Voir la fiche adhérente"
      title="Voir la fiche"
      className={memberDetailLinkClass}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
      </svg>
    </Link>
  );
}

export type MembersManagerHandle = {
  refresh: () => void;
};
type MembersManagerProps = {
  viewMode: "list" | "form";
  onChangeViewMode: (mode: "list" | "form") => void;
  paymentStatusFilter?: "ALL" | MemberPaymentStatus;
  onPaymentStatusFilterChange?: (value: "ALL" | MemberPaymentStatus) => void;
  onUnpaidCountChange?: (count: number) => void;
  prospectConversion?: ProspectConversionContext | null;
  onProspectConversionComplete?: () => void;
};

type MemberItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  pack: { id: string; name: string; durationDays: string | null } | null;
  packStartedAt: string | null;
  packExpiresAt: string | null;
  isActive: boolean;
  isProspectTrial?: boolean;
  enrollmentStatus?: "ACTIVE" | "DEPOSIT_PENDING";
  paymentStatus?: MemberPaymentStatus;
  expectedPackAmountDinars?: number | null;
  totalPaidDinars?: number | null;
  remainingDinars?: number | null;
  depositPaymentMethod?: "CASH" | "CHECK" | "TPE" | null;
  createdAt: string;
  updatedAt: string;
  qrCode:
    | {
        qrId: string;
        qrKey: string | null;
        status: string;
        updatedAt: string;
      }
    | null;
};

type MembersResponse = {
  items: MemberItem[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

type PackItem = {
  id: string;
  name: string;
  category: string | null;
  isActive: boolean;
  sessionCount?: number | null;
  durationDays?: string | null;
  priceCents?: number | null;
  pricing?: PackDisplayPricing;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
};

export const MembersManager = forwardRef<MembersManagerHandle, MembersManagerProps>(function MembersManagerWithRef(
  {
    viewMode,
    onChangeViewMode,
    paymentStatusFilter = "ALL",
    onPaymentStatusFilterChange,
    onUnpaidCountChange,
    prospectConversion = null,
    onProspectConversionComplete,
  },
  ref
) {
  const { toast } = useToast();
  const [items, setItems] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingEnrollmentStatus, setEditingEnrollmentStatus] = useState<
    "ACTIVE" | "DEPOSIT_PENDING" | null
  >(null);
  const [editingExpectedPackAmount, setEditingExpectedPackAmount] = useState<number | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<MemberItem | null>(null);
  const initialQrPublicIdRef = useRef("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "PROSPECT">("ALL");
  const [packCategoryFilter, setPackCategoryFilter] = useState("");
  const [packFilterId, setPackFilterId] = useState<string>("ALL");
  const [packStateFilter, setPackStateFilter] = useState<MemberPackStateFilter>("ALL");
  const [packStates, setPackStates] = useState<Record<string, MemberPrimaryPackKind>>({});
  const [packStateCounts, setPackStateCounts] = useState<MemberPrimaryPackStateCounts>(
    emptyMemberPrimaryPackStateCounts,
  );
  const [packs, setPacks] = useState<PackItem[]>([]);

  const [qrId, setQrId] = useState("");
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<"UNKNOWN" | "UNASSIGNED" | "ASSIGNED" | "NOT_FOUND">("UNKNOWN");
  const [qrAssignedMemberId, setQrAssignedMemberId] = useState<string | null>(null);
  const [isFetchingQrKey, setIsFetchingQrKey] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [packCategory, setPackCategory] = useState("");
  const [packId, setPackId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [discountType, setDiscountType] = useState<"NONE" | PersonalDiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "deposit" | "credit">("full");
  const [depositAmountDinars, setDepositAmountDinars] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PackPaymentMethodValue>("CASH");
  const [note, setNote] = useState("");
  const [depositMember, setDepositMember] = useState<MemberItem | null>(null);
  const [isCompletingDeposit, setIsCompletingDeposit] = useState(false);
  const [page, setPage] = useState(1);

  const isEditingDepositPending = editingEnrollmentStatus === "DEPOSIT_PENDING";
  const editingDepositRemaining = useMemo(() => {
    if (editingExpectedPackAmount == null) return null;
    const deposit = Number.parseInt(depositAmountDinars, 10);
    if (!Number.isFinite(deposit) || deposit < 0) return editingExpectedPackAmount;
    return Math.max(0, editingExpectedPackAmount - deposit);
  }, [depositAmountDinars, editingExpectedPackAmount]);

  const packsForListFilter = useMemo(() => {
    if (!packCategoryFilter.trim()) return packs;
    const cat = normalizePackCategory(packCategoryFilter);
    return packs.filter((p) => p.category && normalizePackCategory(p.category) === cat);
  }, [packs, packCategoryFilter]);

  const packFilterOptions = useMemo(() => {
    let list = packsForListFilter;
    if (packFilterId !== "ALL" && !list.some((p) => p.id === packFilterId)) {
      const selected = packs.find((p) => p.id === packFilterId);
      if (selected) list = [selected, ...list];
    }
    return sortPacksBySessionAsc(list);
  }, [packFilterId, packs, packsForListFilter]);

  const filteredItems = useMemo(() => {
    return sortMembersByCreatedAtDesc(
      items.filter((m) => {
        if (!memberMatchesSearch(m, search)) return false;
        if (packFilterId !== "ALL" && m.pack?.id !== packFilterId) return false;
        if (packCategoryFilter.trim()) {
          const cat = normalizePackCategory(packCategoryFilter);
          const memberPack = m.pack?.id ? packs.find((p) => p.id === m.pack?.id) : null;
          if (!memberPack?.category || normalizePackCategory(memberPack.category) !== cat) {
            return false;
          }
        }
        if (paymentStatusFilter !== "ALL" && (m.paymentStatus ?? "PAID") !== paymentStatusFilter) {
          return false;
        }
        if (packStateFilter !== "ALL") {
          const kind = packStates[m.id] ?? "none";
          if (kind !== packStateFilter) return false;
        }
        if (statusFilter === "ALL") return true;
        if (statusFilter === "PROSPECT") return Boolean(m.isProspectTrial);
        if (statusFilter === "ACTIVE") return m.isActive;
        return !m.isActive;
      }),
    );
  }, [items, search, statusFilter, packFilterId, packCategoryFilter, packs, paymentStatusFilter, packStateFilter, packStates]);

  const visibleItems = useMemo(() => {
    const start = (page - 1) * MEMBERS_PAGE_SIZE;
    return filteredItems.slice(start, start + MEMBERS_PAGE_SIZE);
  }, [filteredItems, page]);

  const meta = useMemo(
    () => ({
      page,
      pageSize: MEMBERS_PAGE_SIZE,
      total: filteredItems.length,
      totalPages: Math.max(1, Math.ceil(filteredItems.length / MEMBERS_PAGE_SIZE)),
    }),
    [filteredItems.length, page],
  );

  const qrIdentifyStatusText = useMemo(() => {
    if (!qrId.trim()) return "optionnel";
    if (qrStatus === "UNKNOWN") return isFetchingQrKey ? "Vérification..." : "Non vérifié";
    if (qrStatus === "UNASSIGNED") return "Disponible";
    if (qrStatus === "ASSIGNED") {
      if (editingMemberId && qrAssignedMemberId === editingMemberId) return "Liée à cette adhérente";
      return "Déjà assigné";
    }
    return "Identifiant introuvable";
  }, [qrStatus, isFetchingQrKey, editingMemberId, qrAssignedMemberId, qrId]);

  const loadPackStates = async () => {
    try {
      const response = await fetch("/api/admin/members/pack-states", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as {
        byMemberId?: Record<string, MemberPrimaryPackKind>;
        counts?: MemberPrimaryPackStateCounts;
      };
      setPackStates(data.byMemberId ?? {});
      setPackStateCounts(data.counts ?? emptyMemberPrimaryPackStateCounts());
    } catch {
      // ignore pack state refresh errors
    }
  };

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: String(MEMBERS_FETCH_PAGE_SIZE),
        enrollment: "ALL",
        status: "ALL",
      });

      const [response] = await Promise.all([
        fetch(`/api/admin/members?${params.toString()}`, { cache: "no-store" }),
        loadPackStates(),
      ]);
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les adhérentes.");
      }
      const data = (await response.json()) as MembersResponse;
      const sorted = sortMembersByCreatedAtDesc(data.items);
      setItems(sorted);
      if (onUnpaidCountChange) {
        onUnpaidCountChange(sorted.filter((m) => (m.paymentStatus ?? "PAID") === "ADVANCE").length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnpaidCount = async () => {
    if (!onUnpaidCountChange) return;
    try {
      const response = await fetch(
        "/api/admin/members?page=1&pageSize=5000&enrollment=ALL&status=ALL",
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const data = (await response.json()) as MembersResponse;
      onUnpaidCountChange(data.items.filter((m) => (m.paymentStatus ?? "PAID") === "ADVANCE").length);
    } catch {
      // ignore badge refresh errors
    }
  };

  const loadPacks = async () => {
    const response = await fetch("/api/admin/packs", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Impossible de charger les packs.");
    }
    const data = (await response.json()) as { items: PackItem[] };
    setPacks(data.items);
  };

  const packsForForm = useMemo(() => {
    if (editingMemberId) return packs;
    return packs.filter((item) => item.isActive);
  }, [packs, editingMemberId]);

  const packsForCategory = useMemo(() => {
    const catRaw = packCategory.trim();
    if (!catRaw) return [];
    const cat = normalizePackCategory(catRaw);
    let list = packsForForm.filter((p) => p.category && normalizePackCategory(p.category) === cat);
    if (packId && !list.some((p) => p.id === packId)) {
      const selected = packsForForm.find((p) => p.id === packId);
      if (selected) list = [selected, ...list];
    }
    return sortPacksBySessionAsc(list);
  }, [packCategory, packId, packsForForm]);

  const selectedPack = useMemo(
    () => packsForForm.find((pack) => pack.id === packId),
    [packId, packsForForm],
  );

  const selectedPackListPriceDinars = useMemo(() => {
    if (!selectedPack) return null;
    return selectedPack.pricing?.finalPriceDinars ?? selectedPack.priceCents ?? null;
  }, [selectedPack]);

  const createDiscountPreview = useMemo(
    () =>
      computePersonalDiscountPreviewFromForm(selectedPackListPriceDinars, discountType, discountValue),
    [selectedPackListPriceDinars, discountType, discountValue],
  );

  const handlePackCategoryChange = (value: string) => {
    setPackCategory(value);
    if (!value.trim()) {
      setPackId("");
      return;
    }
    const cat = normalizePackCategory(value);
    const selected = packsForForm.find((p) => p.id === packId);
    if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
      setPackId("");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMembers();
      void loadPacks();
      void refreshUnpaidCount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handlePackCategoryFilterChange = (value: string) => {
    setPackCategoryFilter(value);
    if (!value.trim()) return;
    const cat = normalizePackCategory(value);
    if (packFilterId === "ALL") return;
    const selected = packs.find((p) => p.id === packFilterId);
    if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
      setPackFilterId("ALL");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, packFilterId, statusFilter, packCategoryFilter, paymentStatusFilter, packStateFilter]);

  useEffect(() => {
    if (page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [page, meta.totalPages]);

  useEffect(() => {
    const trimmed = qrId.trim();
    if (trimmed.length < 10) {
      return;
    }

    let isCancelled = false;

    const run = async () => {
      setIsFetchingQrKey(true);
      setModalError(null);
      try {
        const response = await fetch(`/api/admin/qrcode/${encodeURIComponent(trimmed)}/key`, { cache: "no-store" });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "QR code introuvable.");
        }
        const data = (await response.json()) as {
          qrId: string;
          assignmentStatus: "ASSIGNED" | "UNASSIGNED";
          assignedMemberId: string | null;
          qrKey: string;
        };

        if (isCancelled) return;
        setQrKey(data.qrKey);
        setQrStatus(data.assignmentStatus);
        setQrAssignedMemberId(data.assignedMemberId ?? null);
      } catch (e) {
        if (isCancelled) return;
        setQrKey(null);
        setQrAssignedMemberId(null);
        const message = e instanceof Error ? e.message : "Une erreur est survenue.";
        if (message.toLowerCase().includes("introuvable") || message.toLowerCase().includes("not found")) {
          setQrStatus("NOT_FOUND");
        } else {
          setQrStatus("UNKNOWN");
        }
        setModalError(message);
      } finally {
        if (!isCancelled) setIsFetchingQrKey(false);
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [qrId]);

  const resetForm = () => {
    initialQrPublicIdRef.current = "";
    setQrId("");
    setQrKey(null);
    setQrStatus("UNKNOWN");
    setQrAssignedMemberId(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setBirthDate("");
    setPackCategory("");
    setPackId("");
    setIsActive(true);
    setDiscountType("NONE");
    setDiscountValue("");
    setDiscountReason("");
    setPaymentMode("full");
    setDepositAmountDinars("");
    setPaymentMethod("CASH");
    setNote("");
    setEditingEnrollmentStatus(null);
    setEditingExpectedPackAmount(null);
    setModalError(null);
    setIsSubmitting(false);
    setIsFetchingQrKey(false);
  };

  useEffect(() => {
    if (viewMode === "list") {
      setEditingMemberId(null);
      setEditingEnrollmentStatus(null);
      setEditingExpectedPackAmount(null);
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "form" && !editingMemberId) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset baseline when opening blank form
  }, [viewMode, editingMemberId]);

  const handleStartEdit = (m: MemberItem) => {
    initialQrPublicIdRef.current = m.qrCode?.qrId ?? "";
    setEditingMemberId(m.id);
    setEditingEnrollmentStatus(m.enrollmentStatus ?? "ACTIVE");
    setQrId(m.qrCode?.qrId ?? "");
    setQrKey(null);
    setQrStatus(m.qrCode ? "UNKNOWN" : "UNKNOWN");
    setQrAssignedMemberId(null);
    setFirstName(m.firstName ?? "");
    setLastName(m.lastName ?? "");
    setPhone(m.phone ?? "");
    setEmail(m.email ?? "");
    setBirthDate(m.birthDate ? m.birthDate.split("T")[0] ?? "" : "");
    const memberPack = packs.find((p) => p.id === m.pack?.id);
    setPackCategory(memberPack?.category ? normalizePackCategory(memberPack.category) : "");
    setPackId(m.pack?.id ?? "");
    setIsActive(m.isActive);
    setDepositAmountDinars(String(m.totalPaidDinars ?? ""));
    setPaymentMethod((m.depositPaymentMethod ?? "CASH") as PackPaymentMethodValue);
    setEditingExpectedPackAmount(m.expectedPackAmountDinars ?? null);
    setModalError(null);
    onChangeViewMode("form");
  };

  const handleCreateMemberSubmit = async (createBody: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createBody),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Création impossible.");
      }

      const paymentMode = String(createBody.paymentMode ?? "full");
      const createdWithPartial = paymentMode === "deposit" || paymentMode === "credit";
      await loadMembers();
      await refreshUnpaidCount();
      onChangeViewMode("list");
      if (createdWithPartial) {
        onPaymentStatusFilterChange?.(paymentMode === "credit" ? "CREDIT" : "ADVANCE");
      }
      toast({
        variant: "success",
        title: createdWithPartial
          ? paymentMode === "credit"
            ? "Crédit enregistré"
            : "Acompte enregistré"
          : "Adhérente créée",
        description: createdWithPartial
          ? "L'adhérente reste dans la liste et peut consommer ses séances. Finalisez le solde quand le reste est payé."
          : "La nouvelle adhérente a été ajoutée et le QR code a été assigné.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertProspectSubmit = async (createBody: Record<string, unknown>) => {
    if (!prospectConversion) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/reservations/prospects/${encodeURIComponent(prospectConversion.id)}/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createBody),
        },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Conversion impossible.");
      }
      toast({
        variant: "success",
        title: "Adhérente créée",
        description: "Le pack a été vendu et la séance d'essai a été débitée.",
      });
      onProspectConversionComplete?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setModalError(null);

    const trimmedQr = qrId.trim();

    const isEditMode = editingMemberId !== null;
    if (!isEditMode) return;

    // QR optionnel à la création (assignable plus tard depuis la fiche).

    if (!firstName.trim() || firstName.trim().length < 2) {
      setModalError("Le prénom est obligatoire (2 caractères minimum).");
      return;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      setModalError("Le nom est obligatoire (2 caractères minimum).");
      return;
    }

    if (!phone.trim() || phone.trim().length < 6) {
      setModalError("Le téléphone est obligatoire.");
      return;
    }

    if (!packCategory.trim()) {
      setModalError("Veuillez choisir une catégorie de pack.");
      return;
    }

    if (!packId) {
      setModalError("Veuillez choisir un pack.");
      return;
    }

    if (!isEditMode && discountType !== "NONE") {
      const parsedDiscount = Number.parseInt(discountValue, 10);
      if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0) {
        setModalError("La remise personnalisée doit être un entier positif.");
        return;
      }
      if (discountType === "PERCENT" && parsedDiscount > 100) {
        setModalError("La remise en pourcentage doit être entre 1 et 100.");
        return;
      }
      if (
        discountType === "AMOUNT" &&
        selectedPackListPriceDinars != null &&
        parsedDiscount > selectedPackListPriceDinars
      ) {
        setModalError("La remise ne peut pas dépasser le montant à encaisser.");
        return;
      }
    }

    if (!isEditMode && paymentMode === "deposit") {
      const deposit = Number.parseInt(depositAmountDinars, 10);
      if (!Number.isFinite(deposit) || deposit <= 0) {
        setModalError("Indiquez un montant d'acompte valide.");
        return;
      }
      const expectedTotal =
        createDiscountPreview?.final ?? selectedPackListPriceDinars ?? null;
      if (expectedTotal != null && deposit >= expectedTotal) {
        setModalError("L'acompte doit être inférieur au montant total du pack.");
        return;
      }
    }

    if (!isEditMode) {
      if (trimmedQr && qrStatus === "ASSIGNED") {
        setModalError("Ce QR code est déjà assigné à une adhérente.");
        return;
      }
    } else if (trimmedQr) {
      const changingQr = trimmedQr !== initialQrPublicIdRef.current;
      if (
        changingQr &&
        qrStatus === "ASSIGNED" &&
        qrAssignedMemberId &&
        qrAssignedMemberId !== editingMemberId
      ) {
        setModalError("Ce QR code est déjà assigné à une autre adhérente.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        email: email.trim(),
      };
      if (!isEditingDepositPending) {
        body.isActive = isActive;
      }
      if (firstName.trim().length > 0 && firstName.trim().length < 2) {
        setModalError("Le prenom doit contenir au moins 2 caracteres ou rester vide.");
        return;
      }
      if (firstName.trim().length >= 2) body.firstName = firstName.trim();
      if (lastName.trim().length > 0 && lastName.trim().length < 2) {
        setModalError("Le nom doit contenir au moins 2 caracteres ou rester vide.");
        return;
      }
      if (lastName.trim().length >= 2) body.lastName = lastName.trim();
      if (phone.trim().length > 0 && phone.trim().length < 6) {
        setModalError("Le numéro de téléphone doit contenir au moins 6 chiffres.");
        return;
      }
      if (phone.trim().length >= 6) body.phone = phone.trim();
      if (birthDate) body.birthDate = birthDate;
      if (!isEditingDepositPending) {
        body.packId = packId;
      }
      if (trimmedQr !== initialQrPublicIdRef.current) {
        body.qrId = trimmedQr || undefined;
      }

      if (isEditingDepositPending) {
        const deposit = Number.parseInt(depositAmountDinars, 10);
        if (!Number.isFinite(deposit) || deposit <= 0) {
          setModalError("Indiquez un montant d'acompte valide.");
          return;
        }
        const expectedTotal = editingExpectedPackAmount;
        if (expectedTotal != null && deposit >= expectedTotal) {
          setModalError("L'acompte doit être inférieur au montant total du pack.");
          return;
        }
        body.depositAmountDinars = deposit;
        body.paymentMethod = paymentMethod;
      }

      const response = await fetch(`/api/admin/members/${encodeURIComponent(editingMemberId!)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Mise à jour impossible.");
      }

      await loadMembers();
      await refreshUnpaidCount();
      setEditingMemberId(null);
      onChangeViewMode("list");
      resetForm();
      toast({
        variant: "success",
        title: isEditingDepositPending ? "Avance mise à jour" : "Adhérente mise à jour",
        description: isEditingDepositPending
          ? "Le montant d'acompte et les informations ont été enregistrés."
          : "Les informations ont été enregistrées.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setModalError(message);
      toast({
        variant: "error",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    const target = memberToDelete;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let message = "Suppression impossible.";
        try {
          const text = await response.text();
          if (text) {
            const parsed = JSON.parse(text) as { error?: string };
            if (parsed.error) message = parsed.error;
          }
        } catch {
          //
        }
        throw new Error(message);
      }
      setMemberToDelete(null);
      await loadMembers();
      await refreshUnpaidCount();
      toast({
        variant: "success",
        title: "Adhérente supprimée",
        description:
          `${target.firstName ?? ""} ${target.lastName ?? ""}`.trim() || "Profil retiré — compte supprimé.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({
        variant: "error",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompleteDeposit = async (qrId: string, method: PackPaymentMethodValue) => {
    if (!depositMember) return;
    setIsCompletingDeposit(true);
    try {
      const response = await fetch(
        `/api/admin/members/${encodeURIComponent(depositMember.id)}/complete-deposit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrId, paymentMethod: method }),
        },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Finalisation impossible.");
      }
      setDepositMember(null);
      await loadMembers();
      await refreshUnpaidCount();
      toast({ variant: "success", title: "Acompte finalisé", description: "L'adhérente est maintenant active." });
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Une erreur est survenue.",
      });
    } finally {
      setIsCompletingDeposit(false);
    }
  };

  const renderMemberActions = (m: MemberItem) => {
    const unpaid = (m.paymentStatus ?? "PAID") !== "PAID";
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <MemberDetailLink memberId={m.id} />
        {unpaid ? <FinalizeDepositButton onClick={() => setDepositMember(m)} /> : null}
        <DeleteMemberButton onClick={() => setMemberToDelete(m)} />
      </div>
    );
  };
  useImperativeHandle(ref, () => {
    return {
      refresh() {
        void loadMembers();
      },
    };
  });

  return (
    <div className="space-y-6">
      {viewMode === "list" ? isLoading ? (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">
          Chargement...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <div className="rounded-2xl border border-brand-medium/20 bg-white">
          <div className="border-b border-brand-medium/20 px-5 py-4">
            <MemberPackStateCards
              counts={packStateCounts}
              value={packStateFilter}
              onChange={setPackStateFilter}
            />
          </div>
          <div className="border-b border-brand-medium/20 px-5 py-4">
            <div className="grid min-w-0 w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:min-w-0 md:flex-wrap md:items-end md:gap-2">
              <div className="min-w-0 md:min-w-[10rem] md:flex-1">
                <Input
                  id="members-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nom, téléphone..."
                  className="mt-0 py-2.5"
                />
              </div>
              <SelectMenu
                id="members-payment-status"
                value={paymentStatusFilter}
                onChange={(value) =>
                  onPaymentStatusFilterChange?.((value as "ALL" | MemberPaymentStatus) || "ALL")
                }
                className="md:w-[8.5rem]"
                options={[
                  { value: "ALL", label: "Tous paiements" },
                  { value: "PAID", label: MEMBER_PAYMENT_STATUS_LABELS.PAID },
                  { value: "ADVANCE", label: MEMBER_PAYMENT_STATUS_LABELS.ADVANCE },
                  { value: "CREDIT", label: MEMBER_PAYMENT_STATUS_LABELS.CREDIT },
                ]}
              />
              <SelectMenu
                id="members-status"
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter((value as "ALL" | "ACTIVE" | "INACTIVE" | "PROSPECT") || "ALL")
                }
                className="md:w-[7.5rem]"
                options={[
                  { value: "ALL", label: "Tous" },
                  { value: "ACTIVE", label: "Actives" },
                  { value: "INACTIVE", label: "Inactives" },
                  { value: "PROSPECT", label: "Prospect" },
                ]}
              />
              <SelectMenu
                id="members-pack-category"
                value={packCategoryFilter}
                onChange={handlePackCategoryFilterChange}
                className="md:w-[10.5rem]"
                options={[
                  { value: "", label: "Toutes catégories" },
                  ...PACK_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
                ]}
              />
              <SelectMenu
                id="members-pack"
                value={packFilterId}
                onChange={(value) => setPackFilterId(value)}
                className="md:w-[11rem]"
                options={[
                  {
                    value: "ALL",
                    label: packCategoryFilter.trim() ? "Tous (catégorie)" : "Tous les packs",
                  },
                  ...packFilterOptions.map((pack) => ({ value: pack.id, label: pack.name })),
                ]}
              />
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  onPaymentStatusFilterChange?.("ALL");
                  setPackCategoryFilter("");
                  setPackFilterId("ALL");
                  setPackStateFilter("ALL");
                }}
                aria-label="Réinitialiser les filtres"
                title="Réinitialiser"
                className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
              >
                ×
              </button>
            </div>
          </div>
          {visibleItems.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-brand-dark/60">
              {paymentStatusFilter === "ADVANCE"
                ? "Aucune avance en attente."
                : "Aucune adhérente. Ajustez la recherche ou les filtres."}
            </div>
          ) : (
            <>
              <div className="divide-y divide-brand-medium/15 lg:hidden">
                {visibleItems.map((m) => (
                  <article
                    key={m.id}
                    className={`space-y-3 px-4 py-4 text-sm ${
                      paymentStatusFilter === "ADVANCE" ? "bg-amber-50/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-brand-dark">
                          {true ? (
                            <Link href={`/dashboard/adherents/${m.id}`} className="hover:underline">
                              {(m.firstName || m.lastName)
                                ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
                                : "Adhérente"}
                            </Link>
                          ) : (
                            (m.firstName || m.lastName)
                              ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
                              : "Adhérente"
                          )}
                        </p>
                        <p className="mt-1 text-xs text-brand-dark/65">
                          {paymentStatusFilter === "ADVANCE"
                            ? `Inscrite le ${formatMemberCreatedAt(m.createdAt)}`
                            : `Ajoutée le ${formatMemberCreatedAt(m.createdAt)}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {m.isProspectTrial ? (
                          <MemberProspectTrialBadge />
                        ) : (
                          <>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                m.isActive
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                              }`}
                            >
                              {m.isActive ? "Active" : "Inactive"}
                            </span>
                            {(m.paymentStatus ?? "PAID") !== "PAID" ? (
                              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                {memberPaymentRemainingBadgeLabel(m.paymentStatus ?? "ADVANCE")}
                                {m.remainingDinars != null ? ` · ${m.remainingDinars} DT` : ""}
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-brand-dark/75">
                      <MemberPackCell memberId={m.id} packName={m.pack?.name} packStates={packStates} />
                    </div>
                    {paymentStatusFilter === "ADVANCE" ? (
                      <>
                        <div className="flex flex-col gap-2 text-xs text-brand-dark/75 sm:flex-row sm:items-start sm:justify-between">
                          <DepositAmountCell
                            amount={m.totalPaidDinars ?? 0}
                            method={m.depositPaymentMethod}
                            align="start"
                          />
                          <p className="sm:text-right">
                            Reste :{" "}
                            <span className="font-semibold text-brand-dark">{m.remainingDinars ?? 0} DT</span>
                          </p>
                        </div>
                        <p className="text-xs text-brand-dark/75">Téléphone : {m.phone ?? "—"}</p>
                        <DepositProgressBar
                          paid={m.totalPaidDinars ?? 0}
                          total={m.expectedPackAmountDinars ?? (m.totalPaidDinars ?? 0) + (m.remainingDinars ?? 0)}
                        />
                      </>
                    ) : (
                      <p className="text-xs text-brand-dark/75">
                        Clé QR :{" "}
                        <span className="font-mono tabular-nums">{m.qrCode?.qrKey ?? "—"}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      {true ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            m.qrCode?.qrId
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border border-amber-200 bg-amber-50 text-amber-900"
                          }`}
                        >
                          QR: {m.qrCode?.qrId ? "Assigné" : "Non assigné"}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-dark/60">QR assigné à la finalisation</span>
                      )}
                      {renderMemberActions(m)}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-xs font-semibold text-brand-dark/70">
                      <th className="px-5 py-3 text-left">Nom</th>
                      {paymentStatusFilter === "ADVANCE" ? (
                        <>
                          <th className="px-4 py-3 text-center">Pack</th>
                          <th className="px-4 py-3 text-center">Progression</th>
                          <th className="px-4 py-3 text-center">Acompte</th>
                          <th className="px-4 py-3 text-center">Reste</th>
                          <th className="px-4 py-3 text-center">Téléphone</th>
                          <th className="px-4 py-3 text-center">Date</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-center">Statut</th>
                          <th className="px-4 py-3 text-center">Pack</th>
                          <th className="px-4 py-3 text-center">Date d&apos;ajout</th>
                          <th className="px-4 py-3 text-center">QR</th>
                          <th className="px-4 py-3 text-center">Clé QR</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-medium/15">
                    {visibleItems.map((m) => (
                      <tr key={m.id} className="text-sm">
                        <td className="px-5 py-4 font-semibold text-brand-dark">
                          {true ? (
                            <Link href={`/dashboard/adherents/${m.id}`} className="hover:underline">
                              {(m.firstName || m.lastName)
                                ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
                                : "Adhérente"}
                            </Link>
                          ) : (
                            (m.firstName || m.lastName)
                              ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
                              : "Adhérente"
                          )}
                        </td>
                        {paymentStatusFilter === "ADVANCE" ? (
                          <>
                            <td className="px-4 py-4 text-center text-brand-dark/80">
                              <MemberPackCell memberId={m.id} packName={m.pack?.name} packStates={packStates} />
                            </td>
                            <td className="px-4 py-4">
                              <div className="mx-auto w-28">
                                <DepositProgressBar
                                  paid={m.totalPaidDinars ?? 0}
                                  total={
                                    m.expectedPackAmountDinars ??
                                    (m.totalPaidDinars ?? 0) + (m.remainingDinars ?? 0)
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <DepositAmountCell
                                amount={m.totalPaidDinars ?? 0}
                                method={m.depositPaymentMethod}
                              />
                            </td>
                            <td className="px-4 py-4 text-center font-semibold text-brand-dark">
                              {m.remainingDinars ?? 0} DT
                            </td>
                            <td className="px-4 py-4 text-center text-brand-dark/80">{m.phone ?? "—"}</td>
                            <td className="px-4 py-4 text-center tabular-nums text-brand-dark/80">
                              {formatMemberCreatedAt(m.createdAt)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                {m.isProspectTrial ? (
                                  <MemberProspectTrialBadge />
                                ) : (
                                  <>
                                    <span
                                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        m.isActive
                                          ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                          : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                                      }`}
                                    >
                                      {m.isActive ? "Active" : "Inactive"}
                                    </span>
                                    {(m.paymentStatus ?? "PAID") !== "PAID" ? (
                                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                        {memberPaymentRemainingBadgeLabel(m.paymentStatus ?? "ADVANCE")}
                                        {m.remainingDinars != null ? ` · ${m.remainingDinars} DT` : ""}
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center text-brand-dark/80">
                              <MemberPackCell memberId={m.id} packName={m.pack?.name} packStates={packStates} />
                            </td>
                            <td className="px-4 py-4 text-center tabular-nums text-brand-dark/80">
                              {formatMemberCreatedAt(m.createdAt)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  m.qrCode?.qrId
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                    : "border border-amber-200 bg-amber-50 text-amber-900"
                                }`}
                              >
                                {m.qrCode?.qrId ? "Assigné" : "Non assigné"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-mono text-sm tabular-nums text-brand-dark/80">
                              {m.qrCode?.qrKey ?? "—"}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-4 text-center">
                          {renderMemberActions(m)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 px-5 pb-5">
                <ListPageSummary
                  meta={meta}
                  isLoading={isLoading}
                  hasError={Boolean(error)}
                  itemLabel={paymentStatusFilter === "ADVANCE" ? "avances" : "adhérentes"}
                />
                <ListPagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  ariaLabel="Pagination des adhérentes"
                />
              </div>
            </>
          )}
        </div>
      ) : !editingMemberId ? (
        <MemberCreateFormPanel
          packs={packs}
          resetKey={prospectConversion?.id ?? (viewMode === "form" ? "create" : null)}
          initialValues={
            prospectConversion
              ? {
                  firstName: prospectConversion.firstName,
                  lastName: prospectConversion.lastName,
                  phone: prospectConversion.phone,
                }
              : undefined
          }
          trialCourseLabel={prospectConversion?.courseLabel ?? null}
          title={prospectConversion ? "Convertir en adhérente" : undefined}
          description={
            prospectConversion
              ? `${prospectConversion.firstName} ${prospectConversion.lastName} · Même formulaire que « Nouvelle adhérente ».`
              : undefined
          }
          submitLabel={prospectConversion ? "Créer l'adhérente" : undefined}
          cancelLabel={prospectConversion ? "Annuler" : undefined}
          idPrefix={prospectConversion ? "prospect-member" : "member"}
          isSubmitting={isSubmitting}
          onSubmit={prospectConversion ? handleConvertProspectSubmit : handleCreateMemberSubmit}
          onCancel={() => {
            if (prospectConversion) onProspectConversionComplete?.();
            else onChangeViewMode("list");
          }}
        />
      ) : (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-brand-dark">
            {isEditingDepositPending ? "Modifier une avance" : "Modifier une adhérente"}
          </h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            {isEditingDepositPending ? (
              <>
                Corrigez les informations de l&apos;adhérente. Le QR et l&apos;activation se feront lors de la
                finalisation du solde.
              </>
            ) : (
              <>Mettez à jour les infos, le pack ou le QR code associé si nécessaire.</>
            )}
          </p>

          {isEditingDepositPending ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
              Reste à payer en cours. L&apos;adhérente reste dans la liste et peut consommer ses séances. Finalisez
              le solde pour clôturer l&apos;avance ou le crédit.
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="member-qrid"
                    label={
                      isEditingDepositPending
                        ? "Identifiant QR — assigné à la finalisation"
                        : `Identifiant QR (${qrIdentifyStatusText}) — optionnel`
                    }
                    value={qrId}
                    disabled={isEditingDepositPending}
                    onChange={(e) => {
                      const next = e.target.value;
                      setQrId(next);

                      if (next.trim().length < 10) {
                        setQrKey(null);
                        setQrStatus("UNKNOWN");
                        setQrAssignedMemberId(null);
                        setModalError(null);
                      }
                    }}
                    placeholder="Ex: identifiant qr code"
                  />
                </div>

                <div>
                  <label htmlFor="member-qrkey" className="text-sm font-medium text-brand-dark">
                    Clé QR (optionnel)
                  </label>
                  <div
                    id="member-qrkey"
                    className="mt-2 min-h-[42px] w-full rounded-xl border border-brand-medium/35 bg-zinc-50 px-4 py-2.5 text-sm text-brand-dark/80"
                  >
                    {isFetchingQrKey ? "Chargement..." : qrKey ?? "—"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="member-first"
                    label="Prénom *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="member-last"
                    label="Nom *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Input
                    id="member-email"
                    label="Email (optionnel)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="member-birthdate"
                    label="Date de naissance (optionnel)"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              {isEditingDepositPending ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Pack</p>
                    <p className="mt-2 min-h-[42px] rounded-xl border border-brand-medium/35 bg-zinc-50 px-4 py-2.5 text-sm text-brand-dark/80">
                      {packs.find((p) => p.id === packId)?.name ?? "—"}
                    </p>
                  </div>
                  <Input
                    id="member-phone"
                    label="Téléphone *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SelectMenu
                    id="member-pack-category"
                    label="Catégorie du pack *"
                    value={packCategory}
                    onChange={handlePackCategoryChange}
                    options={[
                      { value: "", label: "Choisir une catégorie" },
                      ...PACK_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
                    ]}
                  />
                  <SelectMenu
                    id="member-pack"
                    value={packId}
                    onChange={(value) => setPackId(value)}
                    label="Pack choisi *"
                    options={[
                      { value: "" as string, label: packCategory ? "Choisir un pack" : "Catégorie d'abord" },
                      ...packsForCategory.map((pack) => ({
                        value: pack.id,
                        label: formatPackSelectOptionLabel(pack),
                      })),
                    ]}
                  />
                  <Input
                    id="member-phone"
                    label="Téléphone *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}

              {isEditingDepositPending ? (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-4 space-y-4">
                  <p className="text-sm font-semibold text-brand-dark">Acompte encaissé</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      id="member-deposit-amount-edit"
                      label="Montant de l'acompte (DT) *"
                      type="number"
                      min={1}
                      value={depositAmountDinars}
                      onChange={(e) => setDepositAmountDinars(e.target.value)}
                    />
                    <PaymentMethodPicker
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      label="Moyen de paiement de l'acompte *"
                    />
                  </div>
                  {editingExpectedPackAmount != null ? (
                    <div className="rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2 text-xs text-brand-dark/75">
                      <p>
                        Total attendu : <span className="font-semibold">{editingExpectedPackAmount} DT</span>
                      </p>
                      <p>
                        Solde restant :{" "}
                        <span className="font-semibold text-brand-dark">
                          {editingDepositRemaining ?? editingExpectedPackAmount} DT
                        </span>
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!isEditingDepositPending ? (
                <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} label="Active" />
              ) : null}
          </div>

          {modalError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {modalError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onChangeViewMode("list")}
              disabled={isSubmitting}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
            >
              Retour à la liste
            </button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Mettre à jour"}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title="Supprimer cette adhérente ?"
        description={
          memberToDelete
            ? memberToDelete.enrollmentStatus === "DEPOSIT_PENDING"
              ? `${memberToDelete.firstName ?? ""} ${memberToDelete.lastName ?? ""}`.trim() ||
                "Cette avance sera supprimée définitivement, y compris l'acompte enregistré."
              : `${memberToDelete.firstName ?? ""} ${memberToDelete.lastName ?? ""}`.trim() ||
                memberToDelete.email ||
                "Cette fiche sera supprimée ainsi que le compte utilisateur associé."
            : undefined
        }
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setMemberToDelete(null);
        }}
        onConfirm={() => void handleConfirmDeleteMember()}
      />

      <MemberDepositCompleteDialog
        member={
          depositMember
            ? {
                id: depositMember.id,
                firstName: depositMember.firstName,
                lastName: depositMember.lastName,
                pack: depositMember.pack ? { name: depositMember.pack.name } : null,
                expectedPackAmountDinars: depositMember.expectedPackAmountDinars ?? null,
                totalPaidDinars: depositMember.totalPaidDinars ?? null,
                remainingDinars: depositMember.remainingDinars ?? null,
                depositPaymentMethod: depositMember.depositPaymentMethod ?? null,
              }
            : null
        }
        isOpen={Boolean(depositMember)}
        isSubmitting={isCompletingDeposit}
        existingQrId={depositMember?.qrCode?.qrId ?? null}
        onClose={() => {
          if (!isCompletingDeposit) setDepositMember(null);
        }}
        onConfirm={(qrId, method) => void handleCompleteDeposit(qrId, method)}
      />
    </div>
  );
});

