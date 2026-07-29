"use client";

import { Button, Modal } from "@/components/ui";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";

export type BookSlotOwnedPackRow = {
  enrollmentId: string;
  packId: string;
  packName: string;
  purchasedAt: string;
  isRenewal: boolean;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
  courseQuotaRemaining: { courseLabel: string; consumed: number; remaining: number; total: number }[];
};

export type BookSlotBookableOption = {
  packId: string;
  packName: string;
  remainingSessions: number;
  remainingForCourse: number;
  courseCoverageLabel: string;
};

export type MemberBookSlotConfirmModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  sessionDateLabel: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  coachName: string | null;
  level: string | null;
  ownedPacks: BookSlotOwnedPackRow[];
  bookableOptions: BookSlotBookableOption[];
  selectedPackId: string;
  onSelectedPackIdChange: (packId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function formatDateFr(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
}

function packStatusLabel(pack: BookSlotOwnedPackRow): string {
  if (pack.remainingSessions > 0) return "En cours";
  if (pack.totalSessions != null && pack.consumedSessions >= pack.totalSessions) return "Terminé";
  return "Terminé";
}

function packStatusClass(pack: BookSlotOwnedPackRow): string {
  if (pack.remainingSessions > 0) {
    return "border-indigo-200 bg-indigo-50 text-indigo-900";
  }
  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}

export function MemberBookSlotConfirmModal({
  isOpen,
  isSubmitting,
  sessionDateLabel,
  courseLabel,
  startTime,
  endTime,
  coachName,
  level,
  ownedPacks,
  bookableOptions,
  selectedPackId,
  onSelectedPackIdChange,
  onClose,
  onConfirm,
}: MemberBookSlotConfirmModalProps) {
  const bookableIds = new Set(bookableOptions.map((o) => o.packId));
  const selectedBookable = bookableOptions.find((o) => o.packId === selectedPackId);

  return (
    <Modal
      isOpen={isOpen}
      title="Confirmer la réservation"
      description="Vérifiez le créneau et le pack à débiter avant de valider."
      panelClassName="max-w-xl"
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:opacity-60"
          >
            Annuler
          </button>
          <Button type="button" disabled={isSubmitting || !selectedPackId} onClick={onConfirm}>
            {isSubmitting ? "Réservation..." : "Confirmer la réservation"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">Créneau</p>
          <p className="mt-1 text-sm font-semibold text-brand-dark">{courseLabel}</p>
          <p className="mt-0.5 text-sm text-brand-dark/75">
            {sessionDateLabel} · {startTime} – {endTime}
            {coachName ? ` · ${coachName}` : ""}
          </p>
          {level && planningLevelLabelFr(level) ? (
            <span
              className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${planningLevelBadgeClass(level)}`}
            >
              {planningLevelLabelFr(level)}
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">
            Packs achetés
          </p>
          <ul className="mt-2 max-h-[min(40vh,320px)] space-y-2 overflow-y-auto overscroll-contain pr-0.5">
            {ownedPacks.length === 0 ? (
              <li className="rounded-xl border border-brand-medium/15 bg-white px-4 py-3 text-sm text-brand-dark/60">
                Aucun pack enregistré.
              </li>
            ) : (
              ownedPacks.map((pack) => {
                const isDebitTarget = bookableIds.has(pack.packId);
                const isSelected = pack.packId === selectedPackId;
                const bookable = bookableOptions.find((o) => o.packId === pack.packId);

                return (
                  <li
                    key={pack.enrollmentId}
                    className={`rounded-xl border px-4 py-3 transition ${
                      isSelected && isDebitTarget
                        ? "border-brand-dark/25 bg-brand-light/30 ring-1 ring-brand-dark/10"
                        : "border-brand-medium/15 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-dark">{pack.packName}</p>
                        <p className="mt-0.5 text-xs text-brand-dark/60">
                          {pack.isRenewal ? "Renouvellement" : "Premier pack"} ·{" "}
                          {formatDateFr(pack.purchasedAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${packStatusClass(pack)}`}
                      >
                        {packStatusLabel(pack)}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg border border-brand-medium/10 bg-zinc-50/80 px-2 py-1.5">
                        <p className="text-[10px] font-semibold uppercase text-brand-dark/45">Total</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-dark">
                          {pack.totalSessions ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-brand-medium/10 bg-zinc-50/80 px-2 py-1.5">
                        <p className="text-[10px] font-semibold uppercase text-brand-dark/45">Consommé</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-dark">
                          {pack.consumedSessions}
                        </p>
                      </div>
                      <div className="rounded-lg border border-brand-medium/10 bg-zinc-50/80 px-2 py-1.5">
                        <p className="text-[10px] font-semibold uppercase text-brand-dark/45">Restant</p>
                        <p className="mt-0.5 text-sm font-bold tabular-nums text-brand-dark">
                          {pack.remainingSessions}
                        </p>
                      </div>
                    </div>

                    {pack.courseQuotaRemaining.length > 0 ? (
                      <p className="mt-2 text-xs text-brand-dark/65">
                        {pack.courseQuotaRemaining
                          .map((q) => `${q.courseLabel} ${q.consumed}/${q.total}`)
                          .join(" · ")}
                      </p>
                    ) : null}

                    {isDebitTarget ? (
                      <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-brand-medium/15 bg-zinc-50/50 px-3 py-2">
                        <input
                          type="radio"
                          name="book-pack"
                          checked={isSelected}
                          disabled={!isDebitTarget || isSubmitting}
                          onChange={() => onSelectedPackIdChange(pack.packId)}
                          className="h-4 w-4 accent-brand-dark"
                        />
                        <span className="text-xs text-brand-dark/80">
                          Débiter ce pack
                          {bookable
                            ? ` · ${bookable.remainingForCourse} séance(s) pour ce cours`
                            : ""}
                        </span>
                      </label>
                    ) : (
                      <p className="mt-2 text-xs text-brand-dark/50">
                        Non éligible pour ce cours ou séances épuisées.
                      </p>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {selectedBookable ? (
          <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-950">
            Pack sélectionné : <span className="font-semibold">{selectedBookable.packName}</span> —{" "}
            {selectedBookable.remainingForCourse} séance(s) restante(s) pour ce cours après débit.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
