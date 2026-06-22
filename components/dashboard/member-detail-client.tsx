"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button, Checkbox, ConfirmDialog, Input, Modal, SelectMenu } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/toast-provider";
import type { MemberDetailData, PackFormItem } from "@/lib/admin/member-detail-server";
import { packRenewalMessageFr, type PackRenewalDecision } from "@/lib/admin/member-pack-renewal";
import { formatYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory } from "@/lib/pack-categories";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";
import { PackMetricsGrid } from "@/components/pack-metrics-grid";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import {
  comparePacksBySessionAsc,
  formatPackPriceDt,
  formatPackSelectOptionLabel,
  resolvePackSessionCount,
} from "@/lib/public-pack-display";
import {
  PACK_PAYMENT_METHOD_LABELS,
  PACK_PAYMENT_METHODS,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";
import type { AdminMemberReservationItem } from "@/lib/admin/member-reservations-list";
import { AdminMemberReservationsPanel } from "@/components/dashboard/reservations/admin-member-reservations-panel";
import { useMemberDetailStore } from "@/store/admin/member-detail-store";
import { displayMemberEmail } from "@/lib/member-display-email";
import { computePersonalDiscountPreview } from "@/lib/member-personal-discount";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

type SlotRow = {
  planningId: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string | null;
  coachName: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  stats: {
    spotsRemaining: number;
    waitSpotsRemaining: number | null;
  };
};

type PackUsageSummary = {
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number | null;
};

function formatDateFr(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
}

function formatDateTimeFr(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function formatPackDurationLabel(durationDays: string | null | undefined): string {
  if (durationDays == null || !String(durationDays).trim()) return "—";
  const n = Number(durationDays);
  if (!Number.isFinite(n)) return String(durationDays);
  return n === 1 ? "1 jour" : `${n} jours`;
}

function formatPackSessionsValue(count: number | null): string {
  if (count === null) return "—";
  return String(count);
}

function formatMemberPersonalDiscount(discount: MemberDetailData["personalDiscount"]): string | null {
  if (!discount) return null;
  return discount.type === "PERCENT" ? `${discount.value}%` : `${discount.value} DT`;
}

function memberInitials(member: MemberDetailData): string {
  const a = (member.firstName?.[0] ?? "").trim();
  const b = (member.lastName?.[0] ?? "").trim();
  const combined = `${a}${b}`.toUpperCase();
  return combined || (displayMemberEmail(member.email)?.[0]?.toUpperCase() ?? "?");
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-brand-medium/15 pb-4">
      <h2 className="text-lg font-semibold text-brand-dark">{title}</h2>
      {description ? <p className="mt-1 text-sm text-brand-dark/65">{description}</p> : null}
    </div>
  );
}

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-brand-dark">{children}</div>
    </div>
  );
}

type PanelMode = "view" | "edit" | "book";

const iconBtnBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

function IconEditButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Modifier l'adhérente"
      title="Modifier"
      className={`${iconBtnBase} border-brand-medium/30 bg-brand-light/40 text-brand-dark focus-visible:ring-brand-medium/30`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
      </svg>
    </button>
  );
}

function IconCloseButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Fermer le formulaire"
      title="Fermer"
      className={`${iconBtnBase} border-brand-medium/30 bg-white text-brand-dark/80 focus-visible:ring-brand-medium/30`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

function IconDeleteButton({
  onClick,
  disabled,
  ariaLabel = "Supprimer l'adhérente",
  title = "Supprimer",
}: {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`${iconBtnBase} border-red-200 bg-red-50 text-red-700 focus-visible:ring-red-200`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
      </svg>
    </button>
  );
}

type MemberDetailClientProps = {
  memberId: string;
  initialMember: MemberDetailData;
  initialPacks: PackFormItem[];
};

export function MemberDetailClient({
  memberId,
  initialMember,
  initialPacks,
}: MemberDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const listPreview = useMemberDetailStore((s) => s.previews[memberId]);
  const cachedPacks = useMemberDetailStore((s) => s.packs);

  const [member, setMember] = useState<MemberDetailData | null>(
    () => initialMember ?? listPreview ?? null
  );
  const [packs, setPacks] = useState<PackFormItem[]>(() =>
    initialPacks.length > 0 ? initialPacks : cachedPacks ?? []
  );
  const [isLoading, setIsLoading] = useState(() => !(initialMember ?? listPreview));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [panelMode, setPanelMode] = useState<PanelMode>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [reservationsReloadToken, setReservationsReloadToken] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [renewModalError, setRenewModalError] = useState<string | null>(null);

  const initialQrPublicIdRef = useRef("");
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
  const [paymentMethod, setPaymentMethod] = useState<PackPaymentMethodValue>("CASH");

  const [renewPackCategory, setRenewPackCategory] = useState("");
  const [renewPackId, setRenewPackId] = useState("");

  const [bookDate, setBookDate] = useState(() => formatYmdLocal(startOfLocalToday()));
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [bookingPlanningId, setBookingPlanningId] = useState<string | null>(null);

  const [upcomingReservations, setUpcomingReservations] = useState<AdminMemberReservationItem[]>([]);
  const [packUsage, setPackUsage] = useState<PackUsageSummary | null>(null);
  const [packUsageLoading, setPackUsageLoading] = useState(true);

  const displayName = useMemo(() => {
    if (!member) return "Adhérente";
    const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();
    return name || displayMemberEmail(member.email) || "Adhérente";
  }, [member]);

  const activePacks = useMemo(() => packs.filter((p) => p.isActive), [packs]);

  const renewPacksForSelect = useMemo(() => {
    if (!renewPackCategory.trim()) return [];
    const cat = normalizePackCategory(renewPackCategory);
    let list = activePacks.filter(
      (item) => item.category && normalizePackCategory(item.category) === cat,
    );
    if (renewPackId && !list.some((p) => p.id === renewPackId)) {
      const selected = activePacks.find((p) => p.id === renewPackId);
      if (selected) list = [selected, ...list];
    }
    return [...list].sort(comparePacksBySessionAsc);
  }, [activePacks, renewPackCategory, renewPackId]);

  const packsForForm = useMemo(() => {
    if (!packCategory.trim()) return [];
    const cat = normalizePackCategory(packCategory);
    let list = packs.filter(
      (item) => item.category && normalizePackCategory(item.category) === cat
    );
    if (packId && !list.some((p) => p.id === packId)) {
      const selected = packs.find((p) => p.id === packId);
      if (selected) list = [selected, ...list];
    }
    return [...list].sort(comparePacksBySessionAsc);
  }, [packs, packCategory, packId]);

  const selectedRenewPack = useMemo(
    () => activePacks.find((p) => p.id === renewPackId) ?? null,
    [activePacks, renewPackId]
  );

  const renewalDurationHint = selectedRenewPack?.durationDays ?? null;

  const renewPreviewDecision = useMemo((): PackRenewalDecision | null => {
    if (!member?.pack || !renewPackId) return null;
    const todayStart = startOfLocalToday();
    const isExpired = Boolean(
      member.packExpiresAt && new Date(member.packExpiresAt).getTime() < todayStart.getTime()
    );
    const remainingSessions = member.packRemainingSessions ?? 0;
    if (isExpired || remainingSessions <= 0) {
      return {
        mode: "immediate",
        remainingSessions,
        isExpired,
        hasActivePack: true,
      };
    }
    return {
      mode: "queued",
      remainingSessions,
      isExpired: false,
      hasActivePack: true,
    };
  }, [member, renewPackId]);

  const renewPreviewMessage =
    renewPreviewDecision && selectedRenewPack
      ? packRenewalMessageFr(renewPreviewDecision, selectedRenewPack.name)
      : null;

  const reservedPlanningIdsForBookDate = useMemo(() => {
    const ids = new Set<string>();
    for (const r of upcomingReservations) {
      if (r.sessionDate === bookDate) ids.add(r.planning.id);
    }
    return ids;
  }, [upcomingReservations, bookDate]);

  const memberPackCatalog = useMemo(() => {
    if (!member?.pack?.id) return null;
    return packs.find((p) => p.id === member.pack?.id) ?? null;
  }, [member, packs]);

  const memberPackSessions = useMemo(() => {
    return memberPackCatalog ? resolvePackSessionCount(memberPackCatalog) : null;
  }, [memberPackCatalog]);

  const memberDiscountPreview = useMemo(
    () => computePersonalDiscountPreview(memberPackCatalog?.priceCents ?? null, member?.personalDiscount ?? null),
    [member?.personalDiscount, memberPackCatalog?.priceCents],
  );

  const populateForm = useCallback((m: MemberDetailData, allPacks: PackFormItem[]) => {
    initialQrPublicIdRef.current = m.qrCode?.qrId ?? "";
    setQrId(m.qrCode?.qrId ?? "");
    setQrKey(m.qrCode?.qrKey ?? null);
    setQrStatus("UNKNOWN");
    setQrAssignedMemberId(null);
    setFirstName(m.firstName ?? "");
    setLastName(m.lastName ?? "");
    setPhone(m.phone ?? "");
    setEmail(m.email ?? "");
    setBirthDate(m.birthDate ? m.birthDate.split("T")[0] ?? "" : "");
    const memberPack = allPacks.find((p) => p.id === m.pack?.id);
    setPackCategory(memberPack?.category ? normalizePackCategory(memberPack.category) : "");
    setPackId(m.pack?.id ?? "");
    setDiscountType(m.personalDiscount?.type ?? "NONE");
    setDiscountValue(m.personalDiscount?.value != null ? String(m.personalDiscount.value) : "");
    setDiscountReason(m.personalDiscount?.reason ?? "");
    setPaymentMethod(m.packPaymentMethod ?? "CASH");
    setIsActive(m.isActive);
    setFormError(null);
  }, []);

  const loadMember = useCallback(async () => {
    setLoadError(null);
    const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Impossible de charger l'adhérente.");
    }
    const data = (await response.json()) as { item: MemberDetailData };
    setMember(data.item);
    useMemberDetailStore.getState().setCachedDetail(data.item);
    return data.item;
  }, [memberId]);

  const loadPacks = useCallback(async () => {
    const response = await fetch("/api/admin/packs", { cache: "no-store" });
    if (!response.ok) throw new Error("Impossible de charger les packs.");
    const data = (await response.json()) as { items: PackFormItem[] };
    setPacks(data.items);
    useMemberDetailStore.getState().setPacks(data.items);
    return data.items;
  }, []);

  const loadPackUsage = useCallback(async () => {
    setPackUsageLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/pack-usage`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger l'utilisation des séances.");
      }
      const data = (await response.json()) as PackUsageSummary;
      setPackUsage(data);
    } catch (e) {
      toast({
        variant: "error",
        title: "Pack",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setPackUsageLoading(false);
    }
  }, [memberId, toast]);

  const loadSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const response = await fetch(
        `/api/admin/reservations?date=${encodeURIComponent(date)}`,
        { cache: "no-store" }
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les créneaux.");
      }
      const data = (await response.json()) as { slots: SlotRow[] };
      setSlots(data.slots);
    } catch (e) {
      setSlots([]);
      setSlotsError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPanelMode("view");
    setLoadError(null);

    const storePacks = useMemberDetailStore.getState().packs;
    const packsData =
      initialPacks.length > 0 ? initialPacks : storePacks?.length ? storePacks : [];

    if (packsData.length > 0) {
      setPacks(packsData);
      if (initialPacks.length > 0) {
        useMemberDetailStore.getState().setPacks(initialPacks);
      }
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const [m, p] = await Promise.all([
          loadMember(),
          packsData.length > 0 ? Promise.resolve(packsData) : loadPacks(),
        ]);
        if (cancelled) return;
        setMember(m);
        setPacks(p);
        populateForm(m, p);
      } catch (e) {
        if (!cancelled) {
          const preview = useMemberDetailStore.getState().previews[memberId];
          const fallback = initialMember ?? preview ?? null;
          if (fallback) {
            setMember(fallback);
            if (packsData.length > 0) populateForm(fallback, packsData);
          }
          setLoadError(e instanceof Error ? e.message : "Erreur");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [memberId, initialMember, initialPacks, loadMember, loadPacks, populateForm]);

  useEffect(() => {
    void loadPackUsage();
  }, [memberId, loadPackUsage]);

  useEffect(() => {
    if (panelMode !== "book" || !bookDate) return;
    void loadSlots(bookDate);
  }, [bookDate, loadSlots, panelMode]);

  useEffect(() => {
    const trimmed = qrId.trim();
    if (panelMode !== "edit" || trimmed.length < 10) return;

    let cancelled = false;
    (async () => {
      setIsFetchingQrKey(true);
      setFormError(null);
      try {
        const response = await fetch(`/api/admin/qrcode/${encodeURIComponent(trimmed)}/key`, {
          cache: "no-store",
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "QR code introuvable.");
        }
        const data = (await response.json()) as {
          assignmentStatus: "ASSIGNED" | "UNASSIGNED";
          assignedMemberId: string | null;
          qrKey: string;
        };
        if (cancelled) return;
        setQrKey(data.qrKey);
        setQrStatus(data.assignmentStatus);
        setQrAssignedMemberId(data.assignedMemberId ?? null);
      } catch (e) {
        if (cancelled) return;
        setQrKey(null);
        setQrAssignedMemberId(null);
        const message = e instanceof Error ? e.message : "Erreur";
        if (message.toLowerCase().includes("introuvable") || message.toLowerCase().includes("not found")) {
          setQrStatus("NOT_FOUND");
        } else {
          setQrStatus("UNKNOWN");
        }
      } finally {
        if (!cancelled) setIsFetchingQrKey(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qrId, panelMode]);

  const handlePackCategoryChange = (value: string) => {
    setPackCategory(value);
    if (!value.trim()) {
      setPackId("");
      return;
    }
    const cat = normalizePackCategory(value);
    const selected = packs.find((p) => p.id === packId);
    if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
      setPackId("");
    }
  };

  const handleRenewPackCategoryChange = (value: string) => {
    setRenewPackCategory(value);
    setRenewModalError(null);
    if (!value.trim()) {
      setRenewPackId("");
      return;
    }
    const cat = normalizePackCategory(value);
    const selected = activePacks.find((p) => p.id === renewPackId);
    if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
      setRenewPackId("");
    }
  };

  const handleSave = async () => {
    if (!member) return;
    setFormError(null);

    const trimmedQr = qrId.trim();
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("L'email n'est pas valide.");
      return;
    }
    if (!packCategory.trim()) {
      setFormError("Veuillez choisir une catégorie de pack.");
      return;
    }
    if (!packId) {
      setFormError("Veuillez choisir un pack.");
      return;
    }
    if (discountType !== "NONE") {
      const parsedDiscount = Number.parseInt(discountValue, 10);
      if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0) {
        setFormError("La remise personnalisée doit être un entier positif.");
        return;
      }
      if (discountType === "PERCENT" && parsedDiscount > 100) {
        setFormError("La remise en pourcentage doit être entre 1 et 100.");
        return;
      }
    }

    if (trimmedQr) {
      const changingQr = trimmedQr !== initialQrPublicIdRef.current;
      if (
        changingQr &&
        qrStatus === "ASSIGNED" &&
        qrAssignedMemberId &&
        qrAssignedMemberId !== member.id
      ) {
        setFormError("Ce QR code est déjà assigné à une autre adhérente.");
        return;
      }
    }

    const body: Record<string, unknown> = { isActive, packId };
    if (trimmedEmail) {
      body.email = trimmedEmail;
    }
    if (firstName.trim().length >= 2) body.firstName = firstName.trim();
    if (lastName.trim().length >= 2) body.lastName = lastName.trim();
    if (phone.trim().length >= 6) body.phone = phone.trim();
    if (birthDate) body.birthDate = birthDate;
    if (trimmedQr !== initialQrPublicIdRef.current) {
      body.qrId = trimmedQr || undefined;
    }
    body.personalDiscount =
      discountType === "NONE"
        ? null
        : {
            type: discountType,
            value: Number.parseInt(discountValue, 10),
            reason: discountReason.trim() || undefined,
          };
    if (packId) {
      body.paymentMethod = paymentMethod;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(member.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Mise à jour impossible.");
      }
      const data = (await response.json()) as { item: MemberDetailData };
      setMember(data.item);
      useMemberDetailStore.getState().setCachedDetail(data.item);
      populateForm(data.item, packs);
      setPanelMode("view");
      toast({ variant: "success", title: "Adhérente mise à jour" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur";
      setFormError(message);
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!member) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(member.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Suppression impossible.");
      }
      toast({ variant: "success", title: "Adhérente supprimée" });
      router.push("/dashboard/adherents");
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRenewPack = async () => {
    if (!renewPackCategory.trim()) {
      setRenewModalError("Veuillez choisir une catégorie de pack.");
      return;
    }
    if (!member || !renewPackId) {
      setRenewModalError("Veuillez choisir un pack.");
      return;
    }
    setIsRenewing(true);
    setRenewModalError(null);
    try {
      const response = await fetch(
        `/api/admin/members/${encodeURIComponent(member.id)}/renew-pack`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packId: renewPackId }),
        }
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Renouvellement impossible.");
      }
      const data = (await response.json()) as {
        renewal?: { mode: string; message: string };
      };
      const updated = await loadMember();
      populateForm(updated, packs);
      setShowRenewModal(false);
      const queued = data.renewal?.mode === "queued";
      toast({
        variant: "success",
        title: queued ? "Pack ajouté en file d'attente" : "Pack renouvelé",
        description: data.renewal?.message,
      });
      await loadPackUsage();
    } catch (e) {
      setRenewModalError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleBookSlot = async (planningId: string) => {
    setBookingPlanningId(planningId);
    try {
      const response = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}/reservations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planningId, sessionDate: bookDate }),
        }
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Réservation impossible.");
      }
      const data = (await response.json()) as {
        item: { status: "BOOKED" | "WAITLIST" };
      };
      const statusLabel =
        data.item.status === "WAITLIST" ? "Liste d'attente" : "Confirmée";
      toast({
        variant: "success",
        title: "Réservation enregistrée",
        description: `Inscription ${statusLabel.toLowerCase()} pour le ${formatDateFr(bookDate)}.`,
      });
      const updated = await loadMember();
      populateForm(updated, packs);
      setReservationsReloadToken((t) => t + 1);
      await Promise.all([
        loadPackUsage(),
        panelMode === "book" ? loadSlots(bookDate) : Promise.resolve(),
      ]);
      router.refresh();
    } catch (e) {
      toast({
        variant: "error",
        title: "Réservation",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setBookingPlanningId(null);
    }
  };

  if (isLoading && !member) {
    return (
      <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">
        Chargement...
      </div>
    );
  }

  if (loadError || !member) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {loadError ?? "Adhérente introuvable."}
        </div>
        <Link
          href="/dashboard/adherents"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark/65 transition hover:text-brand-dark"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Retourner à la liste
        </Link>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title={displayName}
        description="Fiche adhérente, réservations et actions."
        showRoleLine={false}
        actions={
          panelMode === "edit" ? undefined : panelMode === "book" ? (
            <button
              type="button"
              onClick={() => setPanelMode("view")}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
            >
              Retour aux informations
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPanelMode("book")}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-2 5h-5v5h5v-5z" />
                </svg>
                Réserver
              </button>
            </>
          )
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_360px]">
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-brand-medium/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-dark">
                {panelMode === "book" ? "Réserver manuellement" : "Informations"}
              </h2>
              {panelMode === "book" ? (
                <p className="mt-1 text-sm text-brand-dark/65">
                  Choisissez une date puis un créneau pour inscrire l&apos;adhérente.
                </p>
              ) : null}
            </div>
            {panelMode === "view" ? (
              <div className="flex items-center gap-2">
                <IconEditButton onClick={() => setPanelMode("edit")} />
                <IconDeleteButton onClick={() => setShowDeleteConfirm(true)} />
              </div>
            ) : panelMode === "edit" ? (
              <IconCloseButton
                disabled={isSubmitting}
                onClick={() => {
                  populateForm(member, packs);
                  setPanelMode("view");
                }}
              />
            ) : null}
          </div>
          {panelMode === "view" ? (
          <Link
            href="/dashboard/adherents"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 transition hover:text-brand-dark"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Retourner à la liste
          </Link>
          ) : null}

          {panelMode === "view" ? (
            <>
              <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-brand-medium/15 bg-gradient-to-br from-brand-light/30 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-medium/25 bg-white text-lg font-semibold text-brand-dark shadow-sm"
                    aria-hidden="true"
                  >
                    {memberInitials(member)}
                  </div>
                  <p className="text-lg font-semibold text-brand-dark">{displayName}</p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    member.isActive
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                  }`}
                >
                  {member.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoField label="Email">
                  <span className="break-all font-normal text-brand-dark/85">
                    {displayMemberEmail(member.email) ?? "—"}
                  </span>
                </InfoField>
                <InfoField label="Téléphone">{member.phone ?? "—"}</InfoField>
                <InfoField label="Date de naissance">{formatDateFr(member.birthDate)}</InfoField>
                <InfoField label="QR code">
                  <span className="break-all font-mono text-xs font-normal text-brand-dark/85">
                    {member.qrCode?.qrId ?? "Non assigné"}
                  </span>
                </InfoField>
                <InfoField label="Clé QR">
                  <span className="font-mono text-sm font-semibold tracking-widest text-brand-dark">
                    {member.qrCode?.qrKey ?? qrKey ?? "—"}
                  </span>
                </InfoField>
                <InfoField label="Créé le">
                  <span className="font-normal text-brand-dark/85">{formatDateTimeFr(member.createdAt)}</span>
                </InfoField>
              </div>
              <div className="mt-5 rounded-xl border border-brand-medium/15 bg-zinc-50/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-brand-dark">Suivi séances pack</h4>
                  {packUsageLoading ? (
                    <span className="text-xs text-brand-dark/55">Chargement...</span>
                  ) : null}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <InfoField label="Séances pack">
                    {packUsage?.totalSessions != null ? packUsage.totalSessions : "—"}
                  </InfoField>
                  <InfoField label="Séances consommées">{packUsage?.consumedSessions ?? 0}</InfoField>
                  <InfoField label="Séances restantes">
                    {packUsage?.remainingSessions != null ? packUsage.remainingSessions : "—"}
                  </InfoField>
                </div>
                <p className="mt-3 text-xs text-brand-dark/60">
                  Confirmée/Présente consomme une séance. Annulation avant 6 h : non comptabilisée. Annulation tardive :
                  séance comptabilisée. Le détail des réservations est dans la section ci-dessous.
                </p>
                {member && member.pack && member.packRemainingSessions > 0 ? (
                  <p className="mt-2 text-xs font-medium text-brand-dark/75">
                    Séances restantes sur le pack actuel : {member.packRemainingSessions}
                  </p>
                ) : null}
              </div>

              <AdminMemberReservationsPanel
                memberId={memberId}
                reloadToken={reservationsReloadToken}
                onUpcomingChange={setUpcomingReservations}
                onReservationsMutated={() => void loadPackUsage()}
              />
            </>
          ) : panelMode === "edit" ? (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="detail-qrid"
                  label="Identifiant QR"
                  value={qrId}
                  onChange={(e) => setQrId(e.target.value)}
                  placeholder="Identifiant QR"
                />
                <div>
                  <label htmlFor="detail-qrkey" className="text-sm font-medium text-brand-dark">
                    Clé QR
                  </label>
                  <div
                    id="detail-qrkey"
                    className="mt-2 min-h-[42px] w-full rounded-xl border border-brand-medium/35 bg-zinc-50 px-4 py-2.5 text-sm text-brand-dark/80"
                  >
                    {isFetchingQrKey ? "Chargement..." : qrKey ?? "—"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input id="detail-first" label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input id="detail-last" label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="detail-email"
                  label="Email (optionnel)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Laisser vide si connexion par téléphone"
                />
                <DatePicker
                  id="detail-birth"
                  label="Date de naissance"
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="JJ/MM/AAAA"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SelectMenu
                  id="detail-pack-cat"
                  label="Catégorie du pack"
                  value={packCategory}
                  onChange={handlePackCategoryChange}
                  options={[
                    { value: "", label: "Choisir une catégorie" },
                    ...PACK_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
                  ]}
                />
                <SelectMenu
                  id="detail-pack"
                  label="Pack"
                  value={packId}
                  onChange={setPackId}
                  options={[
                    { value: "", label: packCategory ? "Choisir un pack" : "Catégorie d'abord" },
                    ...packsForForm.map((p) => ({ value: p.id, label: formatPackSelectOptionLabel(p) })),
                  ]}
                />
                <Input id="detail-phone" label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SelectMenu
                  id="detail-discount-type"
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
                  id="detail-discount-value"
                  type="number"
                  min={0}
                  disabled={discountType === "NONE"}
                  label={discountType === "PERCENT" ? "Valeur (%)" : "Valeur (DT)"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "PERCENT" ? "Ex: 10" : "Ex: 50"}
                />
                <Input
                  id="detail-discount-reason"
                  disabled={discountType === "NONE"}
                  label="Motif remise (optionnel)"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Ex. : tarif préférentiel"
                />
              </div>
              {packId ? (
                <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 p-4">
                  <p className="text-sm font-semibold text-brand-dark">Moyen de paiement</p>
                  <p className="mt-1 text-xs text-brand-dark/60">
                    Indiquez comment le pack a été encaissé (visible en caisse).
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PACK_PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          paymentMethod === method
                            ? "bg-brand-dark text-white"
                            : "border border-brand-medium/30 bg-white text-brand-dark"
                        }`}
                      >
                        {PACK_PAYMENT_METHOD_LABELS[method]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} label="Actif" />
              {formError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-brand-medium/15 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    populateForm(member, packs);
                    setPanelMode("view");
                  }}
                  disabled={isSubmitting}
                  className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
                >
                  Annuler
                </button>
                <Button type="button" onClick={() => void handleSave()} disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5">
          <div className="max-w-xs">
            <DatePicker
              id="book-date"
              label="Date"
              value={bookDate}
              onChange={setBookDate}
              placeholder="JJ/MM/AAAA"
            />
          </div>
          {slotsLoading ? (
            <p className="mt-4 text-sm text-brand-dark/60">Chargement des créneaux...</p>
          ) : slotsError ? (
            <p className="mt-4 text-sm text-red-700">{slotsError}</p>
          ) : slots.length === 0 ? (
            <p className="mt-4 text-sm text-brand-dark/60">
              Aucun créneau disponible pour cette date (cours passés ou jour sans cours).
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {slots.map((slot) => {
                const alreadyReserved = reservedPlanningIdsForBookDate.has(slot.planningId);
                const canBook =
                  !alreadyReserved &&
                  (slot.stats.spotsRemaining > 0 ||
                    (slot.waitlistCapacity != null && (slot.stats.waitSpotsRemaining ?? 0) > 0));
                const isBooking = bookingPlanningId === slot.planningId;
                return (
                  <li
                    key={slot.planningId}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      alreadyReserved
                        ? "border-zinc-200 bg-zinc-100/70 opacity-75"
                        : "border-brand-medium/15 bg-zinc-50/40 hover:border-brand-medium/30 hover:bg-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-dark">{slot.courseLabel}</p>
                      <p className="mt-0.5 text-xs text-brand-dark/70">
                        {slot.startTime} – {slot.endTime}
                        {slot.coachName ? ` · ${slot.coachName}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {slot.level && planningLevelLabelFr(slot.level) ? (
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${planningLevelBadgeClass(slot.level)}`}
                          >
                            {planningLevelLabelFr(slot.level)}
                          </span>
                        ) : null}
                        <span className="text-xs text-brand-dark/60">
                          {slot.stats.spotsRemaining} place(s)
                          {slot.stats.waitSpotsRemaining != null
                            ? ` · attente ${slot.stats.waitSpotsRemaining}`
                            : ""}
                        </span>
                      </div>
                    </div>
                    {alreadyReserved ? (
                      <span
                        className="inline-flex shrink-0 cursor-not-allowed items-center rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-brand-dark/45"
                        aria-disabled="true"
                      >
                        Déjà réservé
                      </span>
                    ) : (
                      <Button
                        type="button"
                        disabled={!canBook || isBooking}
                        onClick={() => void handleBookSlot(slot.planningId)}
                        className="shrink-0"
                      >
                        {isBooking ? "..." : "Réserver"}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
            </div>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <aside className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-dark">Pack</h3>
            <p className="mt-1 text-sm text-brand-dark/65">Abonnement et validité du pack actuel.</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3">
                <p className="text-base font-semibold text-brand-dark">{member.pack?.name ?? "—"}</p>
                {member.pack ? (
                  <PackMetricsGrid
                    className="mt-3"
                    price={formatPackPriceDt(memberPackCatalog?.priceCents ?? null) ?? "—"}
                    sessions={formatPackSessionsValue(memberPackSessions)}
                    duration={formatPackDurationLabel(member.pack.durationDays)}
                  />
                ) : null}
              </div>
              {member.personalDiscount ? (
                <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-900/80">
                      Remise personnalisée active
                    </p>
                    <p className="text-sm font-bold text-sky-950">
                      {formatMemberPersonalDiscount(member.personalDiscount)}
                    </p>
                  </div>
                  {memberDiscountPreview ? (
                    <div className="mt-2 rounded-lg border border-sky-200/70 bg-white/75 px-3 py-2">
                      <p className="text-xs text-sky-900/80">
                        Prix d&apos;origine: <span className="font-semibold">{memberDiscountPreview.base} DT</span>
                      </p>
                      <p className="text-xs text-sky-900/80">
                        Remise appliquée: <span className="font-semibold">−{memberDiscountPreview.discount} DT</span>
                      </p>
                      <p className="text-xs font-bold text-sky-950">
                        Prix final: {memberDiscountPreview.final} DT
                      </p>
                    </div>
                  ) : null}
                  {member.personalDiscount.reason ? (
                    <p className="mt-1 text-xs text-sky-900/75">
                      Motif: {member.personalDiscount.reason}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Pack début">
                  {member.packStartedAt ? formatDateFr(member.packStartedAt) : "À la première réservation"}
                </InfoField>
                <InfoField label="Expiration du pack">
                  {member.packExpiresAt
                    ? formatDateFr(member.packExpiresAt)
                    : member.pack?.durationDays
                      ? "Après la 1ʳᵉ réservation"
                      : "—"}
                </InfoField>
              </div>
              {member.pack ? (
                <InfoField label="Paiement">
                  <PaymentMethodBadge method={member.packPaymentMethod} fallback="Non renseigné" />
                  {member.depositPaymentMethod &&
                  member.depositPaymentMethod !== member.packPaymentMethod ? (
                    <p className="mt-1 text-xs font-normal text-brand-dark/60">
                      Acompte : <PaymentMethodBadge method={member.depositPaymentMethod} />
                    </p>
                  ) : null}
                </InfoField>
              ) : null}
              {member.pack && member.packRemainingSessions > 0 ? (
                <p className="text-xs text-brand-dark/70">
                  <span className="font-semibold text-brand-dark">{member.packRemainingSessions}</span>{" "}
                  {member.packRemainingSessions === 1 ? "séance restante" : "séances restantes"} sur ce pack.
                </p>
              ) : null}
              {(member.pendingPacks ?? []).length > 0 ? (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/85">
                    Packs en file d&apos;attente
                  </p>
                  <ul className="mt-2 space-y-2">
                    {(member.pendingPacks ?? []).map((pending, index) => (
                      <li key={pending.id} className="text-xs text-amber-950/90">
                        <span className="font-semibold">
                          {index + 1}. {pending.packName}
                        </span>
                        {pending.durationDays ? (
                          <span className="text-amber-900/75"> · {pending.durationDays}</span>
                        ) : null}
                        <span className="block text-[11px] text-amber-900/65">
                          Acheté le {formatDateTimeFr(pending.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-amber-900/75">
                    Activation automatique quand le pack actuel est terminé (séances épuisées ou date expirée).
                  </p>
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              className="mt-5 w-full"
              disabled={!member.pack?.id || isRenewing}
              onClick={() => {
                const memberPack = activePacks.find((p) => p.id === member.pack?.id);
                setRenewPackCategory(
                  memberPack?.category ? normalizePackCategory(memberPack.category) : "",
                );
                setRenewPackId(member.pack?.id ?? "");
                setRenewModalError(null);
                setShowRenewModal(true);
              }}
            >
              Renouveler
            </Button>
          </aside>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer cette adhérente ?"
        description={`${displayName} sera supprimé avec son compte utilisateur.`}
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setShowDeleteConfirm(false);
        }}
        onConfirm={() => void handleDelete()}
      />

      <Modal
        isOpen={showRenewModal}
        title="Renouveler le pack"
        description="Choisissez le nouveau pack."
        onClose={() => {
          if (!isRenewing) setShowRenewModal(false);
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowRenewModal(false)}
              disabled={isRenewing}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
            >
              Annuler
            </button>
            <Button type="button" onClick={() => void handleRenewPack()} disabled={isRenewing || !renewPackId}>
              {isRenewing ? "Validation..." : "Valider"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectMenu
            id="renew-pack-category"
            label="Catégorie du pack"
            value={renewPackCategory}
            onChange={handleRenewPackCategoryChange}
            options={[
              { value: "", label: "Choisir une catégorie" },
              ...PACK_CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
            ]}
          />
          <SelectMenu
            id="renew-pack"
            label="Nouveau pack"
            value={renewPackId}
            onChange={(v) => {
              setRenewPackId(v);
              setRenewModalError(null);
            }}
            options={[
              { value: "", label: renewPackCategory ? "Choisir un pack" : "Catégorie d'abord" },
              ...renewPacksForSelect.map((p) => ({ value: p.id, label: formatPackSelectOptionLabel(p) })),
            ]}
          />
          {selectedRenewPack && renewalDurationHint ? (
            <p className="text-xs text-brand-dark/70">Durée : {renewalDurationHint}.</p>
          ) : null}
          {renewPreviewMessage ? (
            <div
              className={`rounded-xl border px-3 py-2 text-xs ${
                renewPreviewDecision?.mode === "queued"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-sky-200 bg-sky-50 text-sky-950"
              }`}
            >
              {renewPreviewMessage}
            </div>
          ) : null}
          {renewModalError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {renewModalError}
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
