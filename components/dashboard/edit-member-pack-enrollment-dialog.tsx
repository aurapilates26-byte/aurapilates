"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal, SelectMenu } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import { PersonalDiscountFields } from "@/components/dashboard/member-form/personal-discount-fields";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory } from "@/lib/pack-categories";
import {
  buildPackChangePriceSummary,
  formatPackChangeDifferenceLabel,
  type PackChangePriceSummary,
} from "@/lib/pack-enrollment-change-pricing";
import {
  buildPersonalDiscountPayload,
  validatePersonalDiscountForm,
  type PersonalDiscountFormValues,
} from "@/lib/personal-discount-form";
import {
  PACK_PAYMENT_METHODS,
  packPaymentMethodLabel,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";
import { formatPackSelectOptionLabel } from "@/lib/public-pack-display";
import { useMemberOwnedPacksStore } from "@/store/admin/member-owned-packs-store";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

type PersonalDiscountProp = {
  type: PersonalDiscountType;
  value: number;
  reason?: string | null;
} | null;

type PackOption = {
  id: string;
  name: string;
  category: string | null;
  sessionCount: number | null;
  priceCents: number | null;
  durationDays: string | null;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
  isActive?: boolean;
};

export function canEditMemberOwnedPack(pack: MemberOwnedPackDto): boolean {
  if (pack.enrollmentStatus === "REPLACED" || pack.enrollmentStatus === "EXPIRED") return false;
  if (pack.packStartedAt) return false;
  if (pack.consumedSessions > 0) return false;
  return true;
}

type EditMemberPackEnrollmentDialogProps = {
  open: boolean;
  memberId: string;
  pack: MemberOwnedPackDto | null;
  personalDiscount?: PersonalDiscountProp;
  onClose: () => void;
  onSaved?: () => void;
};

function PackChangePriceSummaryPanel({ summary }: { summary: PackChangePriceSummary }) {
  const diff = formatPackChangeDifferenceLabel(summary.differenceDinars);

  const diffToneClass =
    diff.tone === "supplement"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : diff.tone === "refund"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-zinc-200 bg-zinc-50 text-brand-dark";

  return (
    <div className="space-y-3 rounded-xl border border-brand-medium/15 bg-zinc-50/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">
        Comparaison des montants
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-brand-medium/15 bg-white px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">Pack actuel</p>
          <p className="mt-1 text-sm font-semibold text-brand-dark">{summary.currentPackName}</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-brand-dark">{summary.currentPaidDinars} DT</p>
          <p className="mt-0.5 text-[11px] text-brand-dark/55">Montant déjà encaissé</p>
        </div>

        <div className="rounded-lg border border-brand-medium/15 bg-white px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">Nouveau pack</p>
          <p className="mt-1 text-sm font-semibold text-brand-dark">{summary.newPackName}</p>
          {summary.newAmountBeforePersonalDinars !== summary.newListPriceDinars ? (
            <p className="mt-1 text-[11px] font-medium text-brand-dark/45 line-through">
              {summary.newListPriceDinars} DT
            </p>
          ) : null}
          <p className="text-lg font-bold tabular-nums text-brand-dark">{summary.newFinalPriceDinars} DT</p>
          {summary.personalDiscountDinars > 0 ? (
            <p className="mt-0.5 text-[11px] text-sky-900/80">
              Remise personnalisée : −{summary.personalDiscountDinars} DT
            </p>
          ) : null}
        </div>
      </div>

      <div className={`rounded-lg border px-3 py-2.5 ${diffToneClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Écart</p>
          <p className="text-base font-bold tabular-nums">{diff.label}</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed opacity-90">{diff.detail}</p>
      </div>
    </div>
  );
}

export function EditMemberPackEnrollmentDialog({
  open,
  memberId,
  pack,
  personalDiscount = null,
  onClose,
  onSaved,
}: EditMemberPackEnrollmentDialogProps) {
  const { toast } = useToast();
  const notifyPacksChanged = useMemberOwnedPacksStore((s) => s.notifyPacksChanged);
  const setPacks = useMemberOwnedPacksStore((s) => s.setPacks);

  const [packs, setCatalogPacks] = useState<PackOption[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [category, setCategory] = useState("");
  const [packId, setPackId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PackPaymentMethodValue | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPackPreview, setNewPackPreview] = useState<{
    listPriceDinars: number | null;
    amountDinars: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [discountForm, setDiscountForm] = useState<PersonalDiscountFormValues>({
    discountType: "NONE",
    discountValue: "",
    discountReason: "",
  });

  const patchDiscountForm = (patch: Partial<PersonalDiscountFormValues>) => {
    setDiscountForm((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  useEffect(() => {
    if (!open || !pack) return;
    setCategory(pack.category ? normalizePackCategory(pack.category) : "");
    setPackId(pack.packId);
    setPaymentMethod(
      pack.packPaymentMethod === "CASH" ||
        pack.packPaymentMethod === "CHECK" ||
        pack.packPaymentMethod === "TPE"
        ? pack.packPaymentMethod
        : "",
    );
    setDiscountForm({
      discountType: personalDiscount?.type ?? "NONE",
      discountValue: personalDiscount?.value != null ? String(personalDiscount.value) : "",
      discountReason: personalDiscount?.reason ?? "",
    });
    setError(null);
    setNewPackPreview(null);
  }, [open, pack, personalDiscount]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingPacks(true);
    void (async () => {
      try {
        const res = await fetch("/api/admin/packs", { cache: "no-store", credentials: "include" });
        const data = (await res.json().catch(() => null)) as { items?: PackOption[]; error?: string } | null;
        if (!res.ok) throw new Error(data?.error ?? "Chargement des packs impossible");
        if (!cancelled) setCatalogPacks(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) {
          setCatalogPacks([]);
          setError(e instanceof Error ? e.message : "Chargement des packs impossible");
        }
      } finally {
        if (!cancelled) setLoadingPacks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !packId) {
      setNewPackPreview(null);
      return;
    }
    let cancelled = false;
    setLoadingPreview(true);
    void (async () => {
      try {
        const res = await fetch(`/api/admin/packs/${encodeURIComponent(packId)}/payment-preview`, {
          cache: "no-store",
          credentials: "include",
        });
        const data = (await res.json().catch(() => null)) as {
          listPriceDinars?: number | null;
          amountDinars?: number;
          error?: string;
        } | null;
        if (!res.ok) throw new Error(data?.error ?? "Aperçu du prix impossible");
        if (!cancelled) {
          setNewPackPreview({
            listPriceDinars: data?.listPriceDinars ?? null,
            amountDinars: data?.amountDinars ?? 0,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setNewPackPreview(null);
          setError(e instanceof Error ? e.message : "Aperçu du prix impossible");
        }
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, packId]);

  const selectedPack = useMemo(
    () => packs.find((p) => p.id === packId) ?? null,
    [packs, packId],
  );

  const discountBaseDinars = useMemo(() => {
    if (newPackPreview?.amountDinars != null) return newPackPreview.amountDinars;
    if (selectedPack?.priceCents != null) return selectedPack.priceCents;
    return null;
  }, [newPackPreview, selectedPack]);

  const effectivePersonalDiscount = useMemo(() => {
    return buildPersonalDiscountPayload(discountForm) ?? null;
  }, [discountForm]);

  const priceSummary = useMemo(() => {
    if (!pack || !selectedPack || !newPackPreview) return null;

    const summary = buildPackChangePriceSummary({
      currentPaidDinars: pack.totalPaidDinars,
      currentPackName: pack.packName,
      newPackName: selectedPack.name,
      newListPriceDinars: newPackPreview.listPriceDinars ?? selectedPack.priceCents,
      newAmountBeforePersonalDinars: newPackPreview.amountDinars,
      personalDiscount: effectivePersonalDiscount,
    });
    if (!summary) return null;

    const packChanged = packId !== pack.packId;
    const initialDiscountType = personalDiscount?.type ?? "NONE";
    const initialDiscountValue =
      personalDiscount?.value != null ? String(personalDiscount.value) : "";
    const discountFormChanged =
      discountForm.discountType !== initialDiscountType ||
      discountForm.discountValue !== initialDiscountValue;

    if (packChanged || discountFormChanged || summary.differenceDinars !== 0) {
      return summary;
    }
    return null;
  }, [
    pack,
    selectedPack,
    newPackPreview,
    packId,
    effectivePersonalDiscount,
    personalDiscount,
    discountForm.discountType,
    discountForm.discountValue,
  ]);

  const packsForSelect = useMemo(() => {
    const cat = normalizePackCategory(category);
    let list = packs.filter((p) => p.isActive !== false);
    if (cat) {
      list = list.filter((p) => p.category && normalizePackCategory(p.category) === cat);
    }
    if (packId && !list.some((p) => p.id === packId)) {
      const selected = packs.find((p) => p.id === packId);
      if (selected) list = [selected, ...list];
    }
    return list;
  }, [packs, category, packId]);

  const save = async () => {
    if (!pack) return;
    if (!packId) {
      setError("Veuillez choisir un pack.");
      return;
    }

    const discountError = validatePersonalDiscountForm({
      discountType: discountForm.discountType,
      discountValue: discountForm.discountValue,
      listPriceDinars: discountBaseDinars,
    });
    if (discountError) {
      setError(discountError);
      return;
    }

    const personalDiscountPayload =
      discountForm.discountType === "NONE"
        ? null
        : buildPersonalDiscountPayload(discountForm) ?? null;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}/owned-packs/${encodeURIComponent(pack.enrollmentId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            packId,
            paymentMethod: paymentMethod || null,
            personalDiscount: personalDiscountPayload,
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        items?: MemberOwnedPackDto[];
        error?: string;
      } | null;
      if (!res.ok) throw new Error(data?.error ?? "Modification impossible");
      if (data?.items) {
        setPacks(memberId, data.items);
        notifyPacksChanged(memberId, data.items);
      } else {
        notifyPacksChanged(memberId);
      }
      toast({
        variant: "success",
        title: "Pack modifié",
        description:
          priceSummary && priceSummary.differenceDinars !== 0
            ? formatPackChangeDifferenceLabel(priceSummary.differenceDinars).detail
            : "Le pack de l'adhérente a été mis à jour.",
      });
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Modification impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      title="Modifier le pack"
      description={pack ? `Inscription · ${pack.packName}` : undefined}
      panelClassName="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-xs leading-relaxed text-brand-dark/65">
          Réservé aux packs <strong>pas encore démarrés</strong> (aucune séance consommée). Utile si
          le mauvais pack a été sélectionné à l&apos;achat.
        </p>

        {pack ? (
          <div className="rounded-xl border border-brand-medium/15 bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">Montant payé</p>
            <p className="mt-1 text-sm font-semibold text-brand-dark">{pack.packName}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-brand-dark">{pack.totalPaidDinars} DT</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
          <SelectMenu
            id="edit-owned-pack-category"
            label="Catégorie"
            value={category}
            onChange={(value) => {
              setCategory(value);
              setError(null);
              const cat = normalizePackCategory(value);
              const selected = packs.find((p) => p.id === packId);
              if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
                setPackId("");
              }
            }}
            options={[
              { value: "", label: "Toutes / choisir" },
              ...PACK_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
            ]}
          />

          <SelectMenu
            id="edit-owned-pack"
            label="Pack"
            value={packId}
            onChange={(value) => {
              setPackId(value);
              setError(null);
            }}
            options={[
              { value: "", label: loadingPacks ? "Chargement…" : "Choisir un pack" },
              ...packsForSelect.map((p) => ({
                value: p.id,
                label: formatPackSelectOptionLabel(p),
              })),
            ]}
          />
        </div>

        {packId && discountBaseDinars != null ? (
          <PersonalDiscountFields
            idPrefix="edit-owned-pack"
            values={discountForm}
            listPriceDinars={discountBaseDinars}
            hideCatalogWhenNoDiscount
            inline
            onChange={patchDiscountForm}
          />
        ) : null}

        {loadingPreview && packId ? (
          <p className="text-xs text-brand-dark/55">Calcul du prix du pack…</p>
        ) : null}

        {priceSummary ? <PackChangePriceSummaryPanel summary={priceSummary} /> : null}

        <SelectMenu
          id="edit-owned-pack-payment"
          label="Mode de paiement"
          value={paymentMethod}
          onChange={(value) => {
            setPaymentMethod(value as PackPaymentMethodValue | "");
            setError(null);
          }}
          options={[
            { value: "", label: "Non renseigné" },
            ...PACK_PAYMENT_METHODS.map((method) => ({
              value: method,
              label: packPaymentMethodLabel(method),
            })),
          ]}
        />

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-brand-medium/15 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-brand-medium/35 bg-white px-5 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Annuler
          </button>
          <Button type="button" disabled={saving || !packId} onClick={() => void save()}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function PackEnrollmentEditButton({
  onClick,
  disabled,
  label = "Modifier le pack",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-600 bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white transition hover:border-indigo-700 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.99-1.66z" />
      </svg>
      Modifier
    </button>
  );
}
