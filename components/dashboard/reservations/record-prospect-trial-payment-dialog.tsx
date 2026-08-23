"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { PackSummaryCard } from "@/components/dashboard/member-form/pack-summary-card";
import { PaymentMethodPicker } from "@/components/dashboard/member-form/payment-method-picker";
import { PersonalDiscountFields } from "@/components/dashboard/member-form/personal-discount-fields";
import type { ProspectRow } from "@/components/dashboard/reservations/prospect-types";
import {
  buildPersonalDiscountPayload,
  computePersonalDiscountPreviewForForm,
  validatePersonalDiscountForm,
} from "@/lib/personal-discount-form";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import type { ProspectTrialPackDto } from "@/types/admin/prospect-trial-pack";

type RecordProspectTrialPaymentDialogProps = {
  prospect: ProspectRow | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (data: {
    packId: string;
    paymentMethod: PackPaymentMethodValue;
    personalDiscount?: { type: "PERCENT" | "AMOUNT"; value: number; reason?: string };
  }) => void;
};

export function RecordProspectTrialPaymentDialog({
  prospect,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RecordProspectTrialPaymentDialogProps) {
  const [trialPack, setTrialPack] = useState<ProspectTrialPackDto | null>(null);
  const [loadingPack, setLoadingPack] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PackPaymentMethodValue>("CASH");
  const [discountType, setDiscountType] = useState<"NONE" | "PERCENT" | "AMOUNT">("NONE");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !prospect) {
      setTrialPack(null);
      setLoadError(null);
      setLoadingPack(false);
      setPaymentMethod("CASH");
      setDiscountType("NONE");
      setDiscountValue("");
      setDiscountReason("");
      setError(null);
      return;
    }

    let cancelled = false;
    setLoadingPack(true);
    setLoadError(null);
    void fetch(`/api/admin/reservations/prospects/${encodeURIComponent(prospect.id)}/trial-pack`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as { pack?: ProspectTrialPackDto; error?: string } | null;
        if (!res.ok) throw new Error(data?.error ?? "Chargement du pack impossible.");
        return data?.pack ?? null;
      })
      .then((pack) => {
        if (cancelled) return;
        if (!pack) throw new Error("Pack introuvable.");
        setTrialPack(pack);
      })
      .catch((e) => {
        if (cancelled) return;
        setTrialPack(null);
        setLoadError(e instanceof Error ? e.message : "Chargement du pack impossible.");
      })
      .finally(() => {
        if (!cancelled) setLoadingPack(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, prospect]);

  const discountPreview = useMemo(
    () =>
      computePersonalDiscountPreviewForForm(
        trialPack?.listPriceDinars ?? null,
        discountType,
        discountValue,
      ),
    [trialPack?.listPriceDinars, discountType, discountValue],
  );

  const handleSubmit = () => {
    if (!trialPack) {
      setError("Le pack séance à l'unité est requis.");
      return;
    }
    const discountError = validatePersonalDiscountForm({
      discountType,
      discountValue,
      listPriceDinars: trialPack.listPriceDinars,
    });
    if (discountError) {
      setError(discountError);
      return;
    }
    const personalDiscount = buildPersonalDiscountPayload({
      discountType,
      discountValue,
      discountReason,
    });
    const finalAmount = discountPreview?.final ?? trialPack.listPriceDinars;
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      setError("Le montant à encaisser doit être positif.");
      return;
    }
    setError(null);
    onConfirm({
      packId: trialPack.id,
      paymentMethod,
      personalDiscount,
    });
  };

  if (!prospect) return null;

  return (
    <Modal
      isOpen={isOpen}
      title="Encaisser la séance"
      description={`${prospect.firstName} ${prospect.lastName} · ${prospect.courseLabel} — visible en caisse sous « Prospect ».`}
      onClose={onClose}
      panelClassName="w-full max-w-xl sm:max-w-2xl"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-brand-medium/30 bg-white px-5 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Annuler
          </button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || loadingPack || !trialPack}>
            {isSubmitting ? "Encaissement..." : "Encaisser"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {loadError ? <p className="text-sm text-red-700">{loadError}</p> : null}

        {loadingPack ? (
          <p className="text-sm text-brand-dark/70">Chargement du pack séance à l&apos;unité…</p>
        ) : trialPack ? (
          <>
            <PackSummaryCard pack={trialPack} trialSessionLabel={`1× ${prospect.courseLabel}`} compact />

            <PersonalDiscountFields
              idPrefix="trial-prospect"
              values={{ discountType, discountValue, discountReason }}
              listPriceDinars={trialPack.listPriceDinars}
              hideCatalogWhenNoDiscount
              inline
              onChange={(patch) => {
                if (patch.discountType !== undefined) setDiscountType(patch.discountType);
                if (patch.discountValue !== undefined) setDiscountValue(patch.discountValue);
                if (patch.discountReason !== undefined) setDiscountReason(patch.discountReason);
              }}
            />

            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

            {discountPreview ? (
              <p className="rounded-lg border border-brand-medium/15 bg-zinc-50/70 px-3 py-2 text-sm text-brand-dark">
                Montant à encaisser : <span className="font-bold tabular-nums">{discountPreview.final} DT</span>
              </p>
            ) : (
              <p className="rounded-lg border border-brand-medium/15 bg-zinc-50/70 px-3 py-2 text-sm text-brand-dark">
                Montant à encaisser :{" "}
                <span className="font-bold tabular-nums">{trialPack.listPriceDinars} DT</span>
              </p>
            )}
          </>
        ) : null}

        <p className="text-xs text-brand-dark/60">
          La personne reste prospect (non adhérente). L&apos;encaissement apparaît dans la caisse du mois.
        </p>
      </div>
    </Modal>
  );
}
