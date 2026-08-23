"use client";

import { Button, Checkbox, Input, SelectMenu, Textarea } from "@/components/ui";
import { PaymentMethodPicker } from "@/components/dashboard/member-form/payment-method-picker";
import { PersonalDiscountFields } from "@/components/dashboard/member-form/personal-discount-fields";
import type { MemberCreateFormController } from "@/components/dashboard/member-form/use-member-create-form";
import { formatPackSelectOptionLabel } from "@/lib/public-pack-display";

type MemberCreateFormFieldsProps = {
  form: MemberCreateFormController;
  /** Séance d'essai prospect (lecture seule). */
  trialCourseLabel?: string | null;
  idPrefix?: string;
};

export function MemberCreateFormFields({
  form,
  trialCourseLabel,
  idPrefix = "member",
}: MemberCreateFormFieldsProps) {
  const {
    values,
    patch,
    handlePackCategoryChange,
    qrKey,
    isFetchingQrKey,
    qrIdentifyStatusText,
    packsForCategory,
    selectedPackListPriceDinars,
    createDiscountPreview,
    packCategoryOptions,
  } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id={`${idPrefix}-qrid`}
          label={`Identifiant QR (${qrIdentifyStatusText}) — optionnel`}
          value={values.qrId}
          onChange={(e) => {
            const next = e.target.value;
            patch({ qrId: next });
            if (next.trim().length < 10) {
              form.setFormError(null);
            }
          }}
          placeholder="Ex: identifiant qr code"
        />
        <div>
          <label htmlFor={`${idPrefix}-qrkey`} className="text-sm font-medium text-brand-dark">
            Clé QR (optionnel)
          </label>
          <div
            id={`${idPrefix}-qrkey`}
            className="mt-2 min-h-[42px] w-full rounded-xl border border-brand-medium/35 bg-zinc-50 px-4 py-2.5 text-sm text-brand-dark/80"
          >
            {isFetchingQrKey ? "Chargement..." : qrKey ?? "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id={`${idPrefix}-first`}
          label="Prénom *"
          value={values.firstName}
          onChange={(e) => patch({ firstName: e.target.value })}
        />
        <Input
          id={`${idPrefix}-last`}
          label="Nom *"
          value={values.lastName}
          onChange={(e) => patch({ lastName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id={`${idPrefix}-email`}
          label="Email (optionnel)"
          type="email"
          value={values.email}
          onChange={(e) => patch({ email: e.target.value })}
        />
        <Input
          id={`${idPrefix}-birthdate`}
          label="Date de naissance (optionnel)"
          type="date"
          value={values.birthDate}
          onChange={(e) => patch({ birthDate: e.target.value })}
        />
      </div>

      {trialCourseLabel ? (
        <Input
          id={`${idPrefix}-trial-course`}
          label="Cours (séance d'essai)"
          value={trialCourseLabel}
          readOnly
          disabled
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SelectMenu
          id={`${idPrefix}-pack-category`}
          label="Catégorie du pack *"
          value={values.packCategory}
          onChange={handlePackCategoryChange}
          options={[
            { value: "", label: "Choisir une catégorie" },
            ...packCategoryOptions.map((opt) => ({ value: opt.value, label: opt.label })),
          ]}
        />
        <SelectMenu
          id={`${idPrefix}-pack`}
          value={values.packId}
          onChange={(value) => patch({ packId: value })}
          label="Pack choisi *"
          options={[
            { value: "", label: values.packCategory ? "Choisir un pack" : "Catégorie d'abord" },
            ...packsForCategory.map((pack) => ({
              value: pack.id,
              label: formatPackSelectOptionLabel(pack),
            })),
          ]}
        />
        <Input
          id={`${idPrefix}-phone`}
          label="Téléphone *"
          value={values.phone}
          onChange={(e) => patch({ phone: e.target.value })}
        />
      </div>

      <Textarea
        id={`${idPrefix}-note`}
        label="Note (optionnel)"
        value={values.note}
        onChange={(e) => patch({ note: e.target.value })}
        placeholder="Ex. : préférences, informations utiles pour le studio…"
        rows={3}
        maxLength={2000}
      />

      <PersonalDiscountFields
        idPrefix={idPrefix}
        values={{
          discountType: values.discountType,
          discountValue: values.discountValue,
          discountReason: values.discountReason,
        }}
        listPriceDinars={selectedPackListPriceDinars}
        depositHint={values.paymentMode === "deposit"}
        onChange={(discountPatch) => patch(discountPatch)}
      />

      <Checkbox
        checked={values.isActive}
        onChange={(e) => patch({ isActive: e.target.checked })}
        label="Active"
      />

      <div>
        <p className="text-sm font-semibold text-brand-dark">Mode de paiement</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["full", "Paiement complet"],
              ["deposit", "Avance"],
              ["credit", "Crédit (reste à payer)"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                patch({
                  paymentMode: mode,
                  depositAmountDinars: mode === "full" || mode === "credit" ? "" : values.depositAmountDinars,
                });
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                values.paymentMode === mode
                  ? "bg-brand-dark text-white"
                  : "border border-brand-medium/30 bg-white text-brand-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {values.paymentMode === "deposit" ? (
        <Input
          id={`${idPrefix}-deposit-amount`}
          label="Montant de l'acompte (DT)"
          type="number"
          min={1}
          value={values.depositAmountDinars}
          onChange={(e) => patch({ depositAmountDinars: e.target.value })}
        />
      ) : null}

      {values.paymentMode === "credit" ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-950/90">
          Aucun paiement n&apos;est enregistré. Le pack est utilisable immédiatement ; le montant total
          {createDiscountPreview ? (
            <>
              {" "}
              (<span className="font-semibold">{createDiscountPreview.final} DT</span>)
            </>
          ) : selectedPackListPriceDinars != null ? (
            <>
              {" "}
              (<span className="font-semibold">{selectedPackListPriceDinars} DT</span>)
            </>
          ) : null}{" "}
          reste à payer.
        </div>
      ) : null}

      {values.paymentMode !== "credit" ? (
        <PaymentMethodPicker value={values.paymentMethod} onChange={(method) => patch({ paymentMethod: method })} />
      ) : null}
    </div>
  );
}
