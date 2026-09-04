"use client";

import { useEffect, useMemo, useState } from "react";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory } from "@/lib/pack-categories";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import { computePersonalDiscountPreviewFromForm } from "@/lib/member-personal-discount";
import { sortPacksBySessionAsc } from "@/lib/public-pack-display";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";
import type {
  MemberCreateFormInitialValues,
  MemberFormPackItem,
  MemberCreateFormValues,
  QrLookupStatus,
} from "@/components/dashboard/member-form/types";
import {
  buildMemberCreateRequestBody,
  validateMemberCreateForm,
} from "@/lib/member-form/validate-member-create";
import { fetchNextAvailableQrCode } from "@/lib/admin/fetch-next-available-qr";

const EMPTY_VALUES: MemberCreateFormValues = {
  qrId: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthDate: "",
  packCategory: "",
  packId: "",
  isActive: true,
  discountType: "NONE",
  discountValue: "",
  discountReason: "",
  paymentMode: "full",
  depositAmountDinars: "",
  paymentMethod: "CASH",
  note: "",
};

export type UseMemberCreateFormOptions = {
  packs: MemberFormPackItem[];
  initialValues?: MemberCreateFormInitialValues | null;
  /** Réinitialise le formulaire quand cette clé change (ex. id prospect). */
  resetKey?: string | null;
};

export function useMemberCreateForm({ packs, initialValues, resetKey }: UseMemberCreateFormOptions) {
  const [values, setValues] = useState<MemberCreateFormValues>(EMPTY_VALUES);
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<QrLookupStatus>("UNKNOWN");
  const [qrAssignedMemberId, setQrAssignedMemberId] = useState<string | null>(null);
  const [isFetchingQrKey, setIsFetchingQrKey] = useState(false);
  const [isPickingQr, setIsPickingQr] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const packsForForm = useMemo(() => packs.filter((item) => item.isActive), [packs]);

  const packsForCategory = useMemo(() => {
    const catRaw = values.packCategory.trim();
    if (!catRaw) return [];
    const cat = normalizePackCategory(catRaw);
    let list = packsForForm.filter((p) => p.category && normalizePackCategory(p.category) === cat);
    if (values.packId && !list.some((p) => p.id === values.packId)) {
      const selected = packsForForm.find((p) => p.id === values.packId);
      if (selected) list = [selected, ...list];
    }
    return sortPacksBySessionAsc(list);
  }, [packsForForm, values.packCategory, values.packId]);

  const selectedPack = useMemo(
    () => packsForForm.find((pack) => pack.id === values.packId),
    [values.packId, packsForForm],
  );

  const selectedPackListPriceDinars = useMemo(() => {
    if (!selectedPack) return null;
    return selectedPack.pricing?.finalPriceDinars ?? selectedPack.priceCents ?? null;
  }, [selectedPack]);

  const createDiscountPreview = useMemo(
    () =>
      computePersonalDiscountPreviewFromForm(
        selectedPackListPriceDinars,
        values.discountType,
        values.discountValue,
      ),
    [selectedPackListPriceDinars, values.discountType, values.discountValue],
  );

  const qrIdentifyStatusText = useMemo(() => {
    if (!values.qrId.trim()) return "optionnel";
    if (qrStatus === "UNKNOWN") return isFetchingQrKey ? "Vérification..." : "Non vérifié";
    if (qrStatus === "UNASSIGNED") return "Disponible";
    if (qrStatus === "ASSIGNED") return "Déjà assigné";
    return "Identifiant introuvable";
  }, [isFetchingQrKey, qrStatus, values.qrId]);

  const resetForm = (nextInitial?: MemberCreateFormInitialValues | null) => {
    setValues({
      ...EMPTY_VALUES,
      firstName: nextInitial?.firstName ?? "",
      lastName: nextInitial?.lastName ?? "",
      phone: nextInitial?.phone ?? "",
      email: nextInitial?.email ?? "",
      birthDate: nextInitial?.birthDate ?? "",
      note: nextInitial?.note ?? "",
    });
    setQrKey(null);
    setQrStatus("UNKNOWN");
    setQrAssignedMemberId(null);
    setFormError(null);
    setIsFetchingQrKey(false);
    setIsPickingQr(false);
  };

  const clearQrAssignment = () => {
    setValues((prev) => ({ ...prev, qrId: "" }));
    setQrKey(null);
    setQrStatus("UNKNOWN");
    setQrAssignedMemberId(null);
    setFormError(null);
    setIsFetchingQrKey(false);
  };

  const pickAvailableQr = async () => {
    setIsPickingQr(true);
    setFormError(null);
    try {
      const data = await fetchNextAvailableQrCode();
      setValues((prev) => ({ ...prev, qrId: data.qrId }));
      setQrKey(data.qrKey);
      setQrStatus("UNASSIGNED");
      setQrAssignedMemberId(null);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Impossible de récupérer un QR disponible.");
    } finally {
      setIsPickingQr(false);
    }
  };

  useEffect(() => {
    resetForm(initialValues ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when opening / prospect changes
  }, [resetKey]);

  useEffect(() => {
    const trimmed = values.qrId.trim();
    if (!trimmed) {
      setQrKey(null);
      setQrStatus("UNKNOWN");
      setQrAssignedMemberId(null);
      setIsFetchingQrKey(false);
      return;
    }
    if (trimmed.length < 10) return;

    let cancelled = false;

    const run = async () => {
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
          assignmentStatus: QrLookupStatus;
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
        const message = e instanceof Error ? e.message : "Une erreur est survenue.";
        if (message.toLowerCase().includes("introuvable") || message.toLowerCase().includes("not found")) {
          setQrStatus("NOT_FOUND");
        } else {
          setQrStatus("UNKNOWN");
        }
        setFormError(message);
      } finally {
        if (!cancelled) setIsFetchingQrKey(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [values.qrId]);

  const patch = (partial: Partial<MemberCreateFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const handlePackCategoryChange = (value: string) => {
    patch({ packCategory: value });
    if (!value.trim()) {
      patch({ packCategory: value, packId: "" });
      return;
    }
    const cat = normalizePackCategory(value);
    const selected = packsForForm.find((p) => p.id === values.packId);
    if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
      patch({ packCategory: value, packId: "" });
    }
  };

  const validate = (): string | null =>
    validateMemberCreateForm({
      values,
      qrStatus,
      selectedPackListPriceDinars,
      createDiscountPreview,
    });

  const buildSubmitBody = () => buildMemberCreateRequestBody(values);

  return {
    values,
    patch,
    handlePackCategoryChange,
    qrKey,
    qrStatus,
    qrAssignedMemberId,
    isFetchingQrKey,
    isPickingQr,
    pickAvailableQr,
    clearQrAssignment,
    qrIdentifyStatusText,
    packsForCategory,
    selectedPack,
    selectedPackListPriceDinars,
    createDiscountPreview,
    formError,
    setFormError,
    resetForm,
    validate,
    buildSubmitBody,
    packCategoryOptions: PACK_CATEGORY_OPTIONS,
  };
}

export type MemberCreateFormController = ReturnType<typeof useMemberCreateForm>;
