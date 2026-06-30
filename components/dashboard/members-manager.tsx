"use client";

import Link from "next/link";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, SelectMenu, Textarea } from "@/components/ui";
import { MemberDepositCompleteDialog } from "@/components/dashboard/member-deposit-complete-dialog";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory } from "@/lib/pack-categories";
import {
  PACK_PAYMENT_METHODS,
  PACK_PAYMENT_METHOD_LABELS,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";
import { ListPageSummary, ListPagination } from "@/components/dashboard/list-pagination";
import {
  formatPackSelectOptionLabel,
  sortPacksBySessionAsc,
} from "@/lib/public-pack-display";
import { computePersonalDiscountPreviewFromForm } from "@/lib/member-personal-discount";
import type { PackDisplayPricing } from "@/lib/pack-pricing";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

const MEMBERS_PAGE_SIZE = 20;
const MEMBERS_FETCH_PAGE_SIZE = 5000;

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

function PaymentMethodPicker({
  value,
  onChange,
  label = "Moyen de paiement *",
}: {
  value: PackPaymentMethodValue;
  onChange: (method: PackPaymentMethodValue) => void;
  label?: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-brand-dark">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PACK_PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              value === method
                ? "bg-brand-dark text-white"
                : "border border-brand-medium/30 bg-white text-brand-dark"
            }`}
          >
            {PACK_PAYMENT_METHOD_LABELS[method]}
          </button>
        ))}
      </div>
    </div>
  );
}

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
  listMode?: "members" | "deposits";
  viewMode: "list" | "form";
  onChangeViewMode: (mode: "list" | "form") => void;
  onDepositCountChange?: (count: number) => void;
  onShowDeposits?: () => void;
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
  enrollmentStatus?: "ACTIVE" | "DEPOSIT_PENDING";
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
  { listMode = "members", viewMode, onChangeViewMode, onDepositCountChange, onShowDeposits },
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [packCategoryFilter, setPackCategoryFilter] = useState("");
  const [packFilterId, setPackFilterId] = useState<string>("ALL");
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
  const [isActive, setIsActive] = useState(false);
  const [discountType, setDiscountType] = useState<"NONE" | PersonalDiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "deposit">("full");
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
        if (statusFilter === "ALL") return true;
        if (statusFilter === "ACTIVE") return m.isActive;
        return !m.isActive;
      }),
    );
  }, [items, search, statusFilter, packFilterId, packCategoryFilter, packs]);

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

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const enrollment = listMode === "deposits" ? "DEPOSIT_PENDING" : "ACTIVE";
      const params = new URLSearchParams({
        page: "1",
        pageSize: String(MEMBERS_FETCH_PAGE_SIZE),
        enrollment,
        status: "ALL",
      });

      const response = await fetch(`/api/admin/members?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les adhérentes.");
      }
      const data = (await response.json()) as MembersResponse;
      setItems(sortMembersByCreatedAtDesc(data.items));
      if (listMode === "deposits" && onDepositCountChange) {
        onDepositCountChange(data.items.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDepositCount = async () => {
    if (!onDepositCountChange) return;
    try {
      const response = await fetch(
        "/api/admin/members?page=1&pageSize=1&enrollment=DEPOSIT_PENDING&status=ALL",
        { cache: "no-store" }
      );
      if (!response.ok) return;
      const data = (await response.json()) as MembersResponse;
      onDepositCountChange(data.meta?.total ?? 0);
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
      if (listMode === "members") void refreshDepositCount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [listMode]);

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
  }, [listMode, search, packFilterId, statusFilter, packCategoryFilter]);

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
    setIsActive(false);
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

  const handleSubmit = async () => {
    setModalError(null);

    const trimmedQr = qrId.trim();

    const isEditMode = editingMemberId !== null;

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
      if (!isEditMode) {
        const createBody: Record<string, unknown> = {
          qrId: trimmedQr || undefined,
          email: email.trim() || undefined,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          birthDate: birthDate || undefined,
          packId,
          isActive,
          paymentMode,
          paymentMethod,
        };

        if (discountType !== "NONE") {
          createBody.personalDiscount = {
            type: discountType,
            value: Number.parseInt(discountValue, 10),
            reason: discountReason.trim() || undefined,
          };
        }

        if (paymentMode === "deposit") {
          createBody.depositAmountDinars = Number.parseInt(depositAmountDinars, 10);
        }

        const trimmedNote = note.trim();
        if (trimmedNote) {
          createBody.note = trimmedNote;
        }

        const response = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createBody),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Création impossible.");
        }

        const createdWithDeposit = paymentMode === "deposit";
        await loadMembers();
        await refreshDepositCount();
        setEditingMemberId(null);
        if (createdWithDeposit) {
          onShowDeposits?.();
        } else {
          onChangeViewMode("list");
        }
        resetForm();
        toast({
          variant: "success",
          title: createdWithDeposit ? "Acompte enregistré" : "Adhérente créée",
          description: createdWithDeposit
            ? "L'adhérente apparaît dans Avances. Finalisez le solde pour l'ajouter à la liste principale."
            : "La nouvelle adhérente a été ajoutée et le QR code a été assigné.",
        });
        return;
      }

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
      await refreshDepositCount();
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
      await refreshDepositCount();
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
      await refreshDepositCount();
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

  const renderDepositActions = (m: MemberItem) => (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <EditMemberButton onClick={() => handleStartEdit(m)} />
      <DeleteMemberButton onClick={() => setMemberToDelete(m)} />
      <FinalizeDepositButton onClick={() => setDepositMember(m)} />
    </div>
  );

  const renderMemberActions = (m: MemberItem) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <MemberDetailLink memberId={m.id} />
      <DeleteMemberButton onClick={() => setMemberToDelete(m)} />
    </div>
  );
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
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col gap-3 md:flex-row md:items-end md:gap-4">
                <div className="shrink-0">
                  <p className="text-base font-semibold text-brand-dark">
                    {listMode === "deposits" ? "Avances en attente" : "Liste des adhérentes"}
                  </p>
                  <p className="mt-1 text-xs text-brand-dark/60">
                    {search.trim() ||
                    statusFilter !== "ALL" ||
                    packCategoryFilter.trim() ||
                    packFilterId !== "ALL"
                      ? `${filteredItems.length} résultat(s) sur ${items.length} ${
                          listMode === "deposits" ? "avance(s)" : "adhérente(s)"
                        }`
                      : listMode === "deposits"
                        ? `${items.length} avance(s) en attente`
                        : `${items.length} adhérente(s) au total`}
                  </p>
                </div>

                <div className="grid min-w-0 w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:min-w-0 md:flex-1 md:items-end md:gap-2">
                  <div className="min-w-0 md:min-w-[10rem] md:flex-1">
                    <Input
                      id="members-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Nom, téléphone..."
                      className="mt-0 py-2.5"
                    />
                  </div>
                  {listMode === "members" ? (
                    <SelectMenu
                      id="members-status"
                      value={statusFilter}
                      onChange={(value) => setStatusFilter(value)}
                      className="md:w-[7.5rem]"
                      options={[
                        { value: "ALL", label: "Tous" },
                        { value: "ACTIVE", label: "Actives" },
                        { value: "INACTIVE", label: "Inactives" },
                      ]}
                    />
                  ) : null}
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
                      setPackCategoryFilter("");
                      setPackFilterId("ALL");
                    }}
                    aria-label="Réinitialiser les filtres"
                    title="Réinitialiser"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
          {visibleItems.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-brand-dark/60">
              {listMode === "deposits"
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
                      listMode === "deposits" ? "bg-amber-50/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-brand-dark">
                          {listMode === "members" ? (
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
                          {listMode === "deposits"
                            ? `Inscrite le ${formatMemberCreatedAt(m.createdAt)}`
                            : `Ajoutée le ${formatMemberCreatedAt(m.createdAt)}`}
                        </p>
                      </div>
                      {listMode === "members" ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            m.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                          }`}
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          Acompte
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-dark/75">Pack : {m.pack?.name ?? "—"}</p>
                    {listMode === "deposits" ? (
                      <>
                        <div className="flex flex-col gap-2 text-xs text-brand-dark/75 sm:flex-row sm:items-start sm:justify-between">
                          <DepositAmountCell
                            amount={m.totalPaidDinars ?? 0}
                            method={m.depositPaymentMethod}
                            align="start"
                          />
                          <p className="sm:text-right">
                            Solde :{" "}
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
                      {listMode === "members" ? (
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
                      {listMode === "deposits" ? renderDepositActions(m) : renderMemberActions(m)}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-xs font-semibold text-brand-dark/70">
                      <th className="px-5 py-3 text-left">Nom</th>
                      {listMode === "deposits" ? (
                        <>
                          <th className="px-4 py-3 text-center">Pack</th>
                          <th className="px-4 py-3 text-center">Progression</th>
                          <th className="px-4 py-3 text-center">Acompte</th>
                          <th className="px-4 py-3 text-center">Solde</th>
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
                          {listMode === "members" ? (
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
                        {listMode === "deposits" ? (
                          <>
                            <td className="px-4 py-4 text-center text-brand-dark/80">{m.pack?.name ?? "—"}</td>
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
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  m.isActive
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                    : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                                }`}
                              >
                                {m.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center text-brand-dark/80">{m.pack?.name ?? "—"}</td>
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
                          {listMode === "deposits" ? renderDepositActions(m) : renderMemberActions(m)}
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
                  itemLabel={listMode === "deposits" ? "avances" : "adhérentes"}
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
      ) : (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-brand-dark">
            {editingMemberId
              ? isEditingDepositPending
                ? "Modifier une avance"
                : "Modifier une adhérente"
              : "Ajouter une adhérente"}
          </h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            {editingMemberId ? (
              isEditingDepositPending ? (
                <>
                  Corrigez les informations de l&apos;adhérente. Le QR et l&apos;activation se feront lors de la
                  finalisation du solde.
                </>
              ) : (
                <>Mettez à jour les infos, le pack ou le QR code associé si nécessaire.</>
              )
            ) : (
              <>
                Le QR code est optionnel à la création (assignable plus tard depuis la fiche). Si vous le scannez,
                la clé associée sera chargée automatiquement.
              </>
            )}
          </p>

          {isEditingDepositPending ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
              Cette adhérente est en attente de finalisation. Elle n&apos;apparaît pas dans la liste principale tant
              que le solde n&apos;est pas encaissé.
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

              {!editingMemberId ? (
                <Textarea
                  id="member-note"
                  label="Note (optionnel)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex. : préférences, informations utiles pour le studio…"
                  rows={3}
                  maxLength={2000}
                />
              ) : null}

              {!editingMemberId ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SelectMenu
                      id="member-discount-type"
                      label="Remise personnalisée"
                      value={discountType}
                      onChange={(value) => setDiscountType(value as "NONE" | PersonalDiscountType)}
                      options={[
                        { value: "NONE", label: "Aucune remise" },
                        { value: "PERCENT", label: "Pourcentage (%)" },
                        { value: "AMOUNT", label: "Montant (DT)" },
                      ]}
                    />
                    <Input
                      id="member-discount-value"
                      type="number"
                      min={0}
                      disabled={discountType === "NONE"}
                      label={discountType === "PERCENT" ? "Valeur (%)" : "Valeur (DT)"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "PERCENT" ? "Ex: 10" : "Ex: 50"}
                    />
                    <Input
                      id="member-discount-reason"
                      disabled={discountType === "NONE"}
                      label="Motif remise (optionnel)"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Ex. : tarif préférentiel"
                    />
                  </div>
                  {createDiscountPreview ? (
                    <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-900/80">
                        Aperçu du prix final
                      </p>
                      <div className="mt-2 rounded-lg border border-sky-200/70 bg-white/75 px-3 py-2">
                        <p className="text-xs text-sky-900/80">
                          Prix catalogue: <span className="font-semibold">{createDiscountPreview.base} DT</span>
                        </p>
                        <p className="text-xs text-sky-900/80">
                          Remise appliquée: <span className="font-semibold">−{createDiscountPreview.discount} DT</span>
                        </p>
                        <p className="text-xs font-bold text-sky-950">
                          Prix final: {createDiscountPreview.final} DT
                        </p>
                      </div>
                      {paymentMode === "deposit" ? (
                        <p className="mt-2 text-xs text-sky-900/75">
                          L&apos;acompte s&apos;applique sur ce montant final.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}

              {!isEditingDepositPending ? (
                <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} label="Active" />
              ) : null}

              {!editingMemberId ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">Mode de paiement</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("full")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          paymentMode === "full"
                            ? "bg-brand-dark text-white"
                            : "border border-brand-medium/30 bg-white text-brand-dark"
                        }`}
                      >
                        Paiement complet
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("deposit")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          paymentMode === "deposit"
                            ? "bg-brand-dark text-white"
                            : "border border-brand-medium/30 bg-white text-brand-dark"
                        }`}
                      >
                        Acompte seulement
                      </button>
                    </div>
                  </div>

                  {paymentMode === "deposit" ? (
                    <Input
                      id="member-deposit-amount"
                      label="Montant de l'acompte (DT)"
                      type="number"
                      min={1}
                      value={depositAmountDinars}
                      onChange={(e) => setDepositAmountDinars(e.target.value)}
                    />
                  ) : null}

                  <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
                </>
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
              {isSubmitting
                ? editingMemberId
                  ? "Enregistrement..."
                  : "Création..."
                : editingMemberId
                  ? "Mettre à jour"
                  : "Confirmer"}
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
        onClose={() => {
          if (!isCompletingDeposit) setDepositMember(null);
        }}
        onConfirm={(qrId, method) => void handleCompleteDeposit(qrId, method)}
      />
    </div>
  );
});

