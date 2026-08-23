"use client";

import { Input, SelectMenu } from "@/components/ui";
import { computePersonalDiscountPreviewForForm } from "@/lib/personal-discount-form";
import type { PersonalDiscountFormValues } from "@/lib/personal-discount-form";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

/** Labels multi-lignes : hauteur fixe pour aligner les champs sur une row. */
const inlineDiscountFieldClass =
  "min-w-0 [&_label]:flex [&_label]:min-h-[2.5rem] [&_label]:items-end [&_label]:leading-snug";

type PersonalDiscountFieldsProps = {
  idPrefix: string;
  values: PersonalDiscountFormValues;
  listPriceDinars: number | null;
  onChange: (patch: Partial<PersonalDiscountFormValues>) => void;
  depositHint?: boolean;
  /** Masque le bloc « Prix catalogue » quand aucune remise (ex. modale encaissement prospect). */
  hideCatalogWhenNoDiscount?: boolean;
  /** Trois champs sur une seule ligne (modales). */
  inline?: boolean;
};

export function PersonalDiscountFields({
  idPrefix,
  values,
  listPriceDinars,
  onChange,
  depositHint = false,
  hideCatalogWhenNoDiscount = false,
  inline = false,
}: PersonalDiscountFieldsProps) {
  const preview = computePersonalDiscountPreviewForForm(
    listPriceDinars,
    values.discountType,
    values.discountValue,
  );

  return (
    <>
      <div
        className={
          inline
            ? "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end"
            : "grid grid-cols-1 gap-3 md:grid-cols-3"
        }
      >
        <div className={inline ? inlineDiscountFieldClass : undefined}>
          <SelectMenu
            id={`${idPrefix}-discount-type`}
            label="Remise personnalisée"
            value={values.discountType}
            onChange={(value) => onChange({ discountType: value as "NONE" | PersonalDiscountType })}
            options={[
              { value: "NONE", label: "Aucune remise" },
              { value: "PERCENT", label: "Pourcentage (%)" },
              { value: "AMOUNT", label: "Montant (DT)" },
            ]}
          />
        </div>
        <div className={inline ? inlineDiscountFieldClass : undefined}>
          <Input
            id={`${idPrefix}-discount-value`}
            type="number"
            min={0}
            disabled={values.discountType === "NONE"}
            label={values.discountType === "PERCENT" ? "Valeur (%)" : "Valeur (DT)"}
            value={values.discountValue}
            onChange={(e) => onChange({ discountValue: e.target.value })}
            placeholder={values.discountType === "PERCENT" ? "Ex: 10" : "Ex: 50"}
          />
        </div>
        <div className={inline ? inlineDiscountFieldClass : undefined}>
          <Input
            id={`${idPrefix}-discount-reason`}
            disabled={values.discountType === "NONE"}
            label="Motif remise (optionnel)"
            value={values.discountReason}
            onChange={(e) => onChange({ discountReason: e.target.value })}
            placeholder="Ex. : tarif préférentiel"
          />
        </div>
      </div>

      {preview ? (
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-900/80">
            Aperçu du prix final
          </p>
          <div className="mt-2 rounded-lg border border-sky-200/70 bg-white/75 px-3 py-2">
            <p className="text-xs text-sky-900/80">
              Prix catalogue: <span className="font-semibold">{preview.base} DT</span>
            </p>
            <p className="text-xs text-sky-900/80">
              Remise appliquée: <span className="font-semibold">−{preview.discount} DT</span>
            </p>
            <p className="text-xs font-bold text-sky-950">Prix final: {preview.final} DT</p>
          </div>
          {depositHint ? (
            <p className="mt-2 text-xs text-sky-900/75">L&apos;acompte s&apos;applique sur ce montant final.</p>
          ) : null}
        </div>
      ) : listPriceDinars != null && !hideCatalogWhenNoDiscount ? (
        <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">Prix catalogue</p>
          <p className="mt-1 text-sm font-bold text-brand-dark">{listPriceDinars} DT</p>
        </div>
      ) : null}
    </>
  );
}
