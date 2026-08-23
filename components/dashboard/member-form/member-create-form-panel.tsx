"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { MemberCreateFormFields } from "@/components/dashboard/member-form/member-create-form-fields";
import type { MemberCreateFormInitialValues, MemberFormPackItem } from "@/components/dashboard/member-form/types";
import { useMemberCreateForm } from "@/components/dashboard/member-form/use-member-create-form";

type MemberCreateFormPanelProps = {
  packs: MemberFormPackItem[];
  initialValues?: MemberCreateFormInitialValues | null;
  resetKey?: string | null;
  trialCourseLabel?: string | null;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  idPrefix?: string;
  isSubmitting?: boolean;
  onSubmit: (body: Record<string, unknown>) => Promise<void> | void;
  onCancel: () => void;
  /** page = carte pleine page · plain = contenu seul (ex. modale) */
  variant?: "page" | "plain";
  showHeader?: boolean;
};

export function MemberCreateFormPanel({
  packs,
  initialValues,
  resetKey,
  trialCourseLabel,
  title = "Ajouter une adhérente",
  description = "Le QR code est optionnel à la création (assignable plus tard depuis la fiche). Si vous le scannez, la clé associée sera chargée automatiquement.",
  submitLabel = "Confirmer",
  cancelLabel = "Retour à la liste",
  idPrefix = "member",
  isSubmitting = false,
  onSubmit,
  onCancel,
  variant = "page",
  showHeader = true,
}: MemberCreateFormPanelProps) {
  const form = useMemberCreateForm({ packs, initialValues, resetKey });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const displayError = submitError ?? form.formError;

  const handleSubmit = async () => {
    setSubmitError(null);
    form.setFormError(null);
    const validationError = form.validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    try {
      await onSubmit(form.buildSubmitBody());
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
  };

  const content = (
    <>
      {showHeader ? (
        <div>
          <h3 className="text-xl font-semibold text-brand-dark">{title}</h3>
          <p className="mt-2 text-sm text-brand-dark/70">{description}</p>
          {trialCourseLabel ? (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-950">
              Séance d&apos;essai : <span className="font-semibold">{trialCourseLabel}</span> — sera débitée du pack
              acheté.
            </div>
          ) : null}
        </div>
      ) : trialCourseLabel ? (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-950">
          Séance d&apos;essai : <span className="font-semibold">{trialCourseLabel}</span> — sera débitée du pack acheté.
        </div>
      ) : null}

      <div className={showHeader ? "mt-5" : ""}>
        <MemberCreateFormFields form={form} trialCourseLabel={null} idPrefix={idPrefix} />
      </div>

      {displayError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {displayError}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </>
  );

  if (variant === "plain") {
    return content;
  }

  return <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">{content}</div>;
}
