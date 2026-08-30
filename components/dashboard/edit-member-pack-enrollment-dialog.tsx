"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal, SelectMenu } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import { PersonalDiscountFields } from "@/components/dashboard/member-form/personal-discount-fields";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { normalizePackCategory, PACK_CATEGORY_OPTIONS } from "@/lib/pack-categories";
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
  const [packId, setPackId] = useState("");
  const [packCategory, setPackCategory] = useState("");
  const [additionalSessions, setAdditionalSessions] = useState("0");
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
    setPackId(pack.packId);
    setPackCategory(pack.category ? normalizePackCategory(pack.category) : "");
    setAdditionalSessions(
      (pack.additionalSessionsCredit ?? 0) > 0 ? String(pack.additionalSessionsCredit) : "0",
    );
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

  const originalCategory = useMemo(
    () => (pack?.category ? normalizePackCategory(pack.category) : ""),
    [pack?.category],
  );

  const categoryChanged = useMemo(() => {
    if (!originalCategory || !packCategory.trim()) return false;
    return normalizePackCategory(packCategory) !== originalCategory;
  }, [originalCategory, packCategory]);

  const packsForSelect = useMemo(() => {
    let list = packs.filter((p) => p.isActive !== false);
    const cat = packCategory.trim();
    if (cat) {
      const normalized = normalizePackCategory(cat);
      list = list.filter(
        (p) => p.category && normalizePackCategory(p.category) === normalized,
      );
    }
    if (packId && !list.some((p) => p.id === packId)) {
      const selected = packs.find((p) => p.id === packId);
      if (selected) list = [selected, ...list];
    }
    return list;
  }, [packs, packCategory, packId]);

  const selectedPackCatalogSessions = useMemo(() => {
    if (!selectedPack) return null;
    if (selectedPack.courseQuotas && selectedPack.courseQuotas.length > 0) {
      return selectedPack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
    }
    return selectedPack.sessionCount;
  }, [selectedPack]);

  const parsedAdditionalSessions = useMemo(() => {
    const trimmed = additionalSessions.trim();
    if (!trimmed) return 0;
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [additionalSessions]);

  const showAdditionalSessionsField = useMemo(() => {
    if (categoryChanged) return true;
    return Boolean(pack?.categoryReassignedAt);
  }, [categoryChanged, pack?.categoryReassignedAt]);

  const creditedSessionsPreview = useMemo(() => {
    if (!showAdditionalSessionsField || selectedPackCatalogSessions == null || parsedAdditionalSessions == null) {
      return null;
    }
    return selectedPackCatalogSessions + parsedAdditionalSessions;
  }, [showAdditionalSessionsField, selectedPackCatalogSessions, parsedAdditionalSessions]);

  const oldPackRemainingSummary = useMemo(() => {
    if (!pack) return null;
    if (pack.courseQuotaRemaining.length > 0) {
      const parts = pack.courseQuotaRemaining
        .filter((q) => q.remaining > 0)
        .map((q) => `${q.courseLabel} : ${q.remaining}`);
      if (parts.length === 0) return "Aucune séance restante sur l'ancien pack.";
      return parts.join(" · ");
    }
    if (pack.remainingSessions > 0) {
      return `${pack.remainingSessions} séance${pack.remainingSessions > 1 ? "s" : ""} restante${pack.remainingSessions > 1 ? "s" : ""}`;
    }
    return "Aucune séance restante sur l'ancien pack.";
  }, [pack]);

  const handlePackCategoryChange = (value: string) => {
    setPackCategory(value);
    setError(null);
    if (!value.trim()) {
      setPackId("");
      return;
    }
    const cat = normalizePackCategory(value);
    const selected = packs.find((p) => p.id === packId);
    if (selected && normalizePackCategory(selected.category ?? "") !== cat) {
      setPackId("");
    }
    if (value && normalizePackCategory(value) === originalCategory) {
      setAdditionalSessions("0");
    }
  };

  const save = async () => {
    if (!pack) return;
    if (!packId) {
      setError("Veuillez choisir un pack.");
      return;
    }

    if (showAdditionalSessionsField) {
      if (!packCategory.trim()) {
        setError("Veuillez choisir une catégorie.");
        return;
      }
      if (parsedAdditionalSessions == null) {
        setError("Le nombre de séances supplémentaires est invalide.");
        return;
      }
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
            ...(showAdditionalSessionsField
              ? { additionalSessions: parsedAdditionalSessions ?? 0 }
              : {}),
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
          Corriger le pack catalogue de cette inscription. Vous pouvez changer la{" "}
          <strong>catégorie</strong> et le pack ; la date d&apos;achat et la première réservation
          restent inchangées. En cas de changement de catégorie, saisissez les séances
          supplémentaires à créditer en plus du nouveau pack (report ou conversion manuelle).
        </p>

        {pack ? (
          <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/70 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">
              Ancien pack — séances restantes
            </p>
            <p className="mt-1 text-sm text-brand-dark">{oldPackRemainingSummary}</p>
            {pack.packStartedAt ? (
              <p className="mt-1 text-[11px] text-brand-dark/55">
                1ʳᵉ séance :{" "}
                {new Date(pack.packStartedAt).toLocaleDateString("fr-FR")} · Achat :{" "}
                {new Date(pack.purchasedAt).toLocaleDateString("fr-FR")}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-brand-dark/55">
                Achat : {new Date(pack.purchasedAt).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        ) : null}

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
            value={packCategory}
            onChange={handlePackCategoryChange}
            options={[
              { value: "", label: "Choisir une catégorie" },
              ...PACK_CATEGORY_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })),
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
              {
                value: "",
                label: loadingPacks
                  ? "Chargement…"
                  : packCategory.trim()
                    ? "Choisir un pack"
                    : "Catégorie d'abord",
              },
              ...packsForSelect.map((p) => ({
                value: p.id,
                label: formatPackSelectOptionLabel(p),
              })),
            ]}
          />
        </div>

        {showAdditionalSessionsField ? (
          <div className="space-y-2 rounded-xl border border-sky-200/80 bg-sky-50/50 px-3 py-3">
            <label htmlFor="edit-owned-pack-additional" className="block text-sm font-medium text-brand-dark">
              Séances supplémentaires
            </label>
            <p className="text-[11px] leading-relaxed text-brand-dark/60">
              Séances à ajouter en plus du nouveau pack catalogue (report ou conversion depuis
              l&apos;ancien pack). Ex. pack 10 séances + 5 reportées = 15 au total.
            </p>
            <input
              id="edit-owned-pack-additional"
              type="number"
              min={0}
              max={999}
              step={1}
              inputMode="numeric"
              value={additionalSessions}
              onChange={(e) => {
                setAdditionalSessions(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-brand-medium/25 bg-white px-3 py-2 text-sm text-brand-dark tabular-nums focus:border-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-medium/20"
            />
            {selectedPackCatalogSessions != null && parsedAdditionalSessions != null ? (
              <p className="text-xs font-medium text-sky-950/85">
                Total crédité : {selectedPackCatalogSessions} (pack) + {parsedAdditionalSessions}{" "}
                (suppl.) ={" "}
                <span className="font-bold tabular-nums">{creditedSessionsPreview}</span> séances
              </p>
            ) : null}
          </div>
        ) : null}

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
