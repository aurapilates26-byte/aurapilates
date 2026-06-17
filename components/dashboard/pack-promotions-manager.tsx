"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { PackPriceDisplay } from "@/components/dashboard/pack-price-display";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, Select } from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { parseYmdToPrismaDate } from "@/lib/calendar-day";
import { formatPromotionPeriodFr, promotionLifecycleLabelFr } from "@/lib/pack-pricing";
import type { PackDisplayPricing } from "@/lib/pack-pricing";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory, packCategoryMenuLabel } from "@/lib/pack-categories";
import { formatPackPriceDt } from "@/lib/public-pack-display";
import type { AdminPackPromotionItem } from "@/types/admin/pack-promotion";
import { usePacksStore } from "@/store/admin/packs-store";

const promotionRowIconBtnClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

export type PackPromotionsManagerHandle = {
  refresh: () => void;
};

type PackOption = {
  id: string;
  name: string;
  priceCents: number | null;
  category: string | null;
};

type PackPromotionsManagerProps = {
  viewMode: "promotions" | "promotion-form";
  onChangeViewMode: (mode: "promotions" | "promotion-form") => void;
  onBackToPacks: () => void;
};

export const PackPromotionsManager = forwardRef<PackPromotionsManagerHandle, PackPromotionsManagerProps>(
  function PackPromotionsManagerWithRef({ viewMode, onChangeViewMode, onBackToPacks }, ref) {
    const { toast } = useToast();
    const items = usePacksStore((s) => s.promotions);
    const storePacks = usePacksStore((s) => s.packs);
    const isLoading = usePacksStore((s) => s.isLoadingPromotions);
    const promotionsLoaded = usePacksStore((s) => s.promotionsLoaded);
    const error = usePacksStore((s) => s.error);
    const syncAll = usePacksStore((s) => s.syncAll);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [promotionToDelete, setPromotionToDelete] = useState<AdminPackPromotionItem | null>(null);

    const [label, setLabel] = useState("");
    const [appliesToAll, setAppliesToAll] = useState(false);
    const [packCategoryFilter, setPackCategoryFilter] = useState("");
    const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
    const [discountPercent, setDiscountPercent] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [isActive, setIsActive] = useState(true);

    const packOptions = useMemo<PackOption[]>(
      () =>
        storePacks.map((p) => ({
          id: p.id,
          name: p.name,
          priceCents: p.priceCents,
          category: p.category,
        })),
      [storePacks],
    );

    const categoryOptionsInUse = useMemo(() => {
      const inUse = new Set<string>();
      for (const p of packOptions) {
        const c = normalizePackCategory(p.category ?? "");
        if (c) inUse.add(c);
      }
      return PACK_CATEGORY_OPTIONS.filter((opt) => inUse.has(opt.value));
    }, [packOptions]);

    const filteredPackOptions = useMemo(() => {
      if (!packCategoryFilter) return [];
      const normalized = normalizePackCategory(packCategoryFilter);
      return packOptions.filter((p) => normalizePackCategory(p.category ?? "") === normalized);
    }, [packOptions, packCategoryFilter]);

    const selectedOutsideFilterCount = useMemo(() => {
      if (!packCategoryFilter) return 0;
      const visibleIds = new Set(filteredPackOptions.map((p) => p.id));
      return selectedPackIds.filter((id) => !visibleIds.has(id)).length;
    }, [selectedPackIds, filteredPackOptions, packCategoryFilter]);

    const canPreviewPrices = useMemo(() => {
      const percent = Number(discountPercent);
      const start = parseYmdToPrismaDate(startsAt);
      const end = parseYmdToPrismaDate(endsAt);
      return (
        Number.isFinite(percent) &&
        percent >= 1 &&
        percent <= 100 &&
        start != null &&
        end != null
      );
    }, [discountPercent, startsAt, endsAt]);

    const getPackCardPricing = (pack: PackOption): PackDisplayPricing => {
      const empty: PackDisplayPricing = {
        originalPriceDinars: pack.priceCents,
        finalPriceDinars: pack.priceCents,
        hasDiscount: false,
        discountPercent: null,
        promotionId: null,
        promotionLabel: null,
      };
      if (pack.priceCents == null) {
        return {
          ...empty,
          originalPriceDinars: null,
          finalPriceDinars: null,
        };
      }
      if (!canPreviewPrices) return empty;

      const percent = Math.round(Number(discountPercent));
      const finalPriceDinars = Math.max(0, Math.round(pack.priceCents * (1 - percent / 100)));
      return {
        originalPriceDinars: pack.priceCents,
        finalPriceDinars: finalPriceDinars,
        hasDiscount: finalPriceDinars < pack.priceCents,
        discountPercent: percent,
        promotionId: null,
        promotionLabel: null,
      };
    };

    const togglePackSelection = (id: string) => {
      setSelectedPackIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    };

    const resetForm = () => {
      setEditingId(null);
      setLabel("");
      setAppliesToAll(false);
      setPackCategoryFilter("");
      setSelectedPackIds([]);
      setDiscountPercent("");
      setStartsAt("");
      setEndsAt("");
      setIsActive(true);
      setFormError(null);
    };

    useEffect(() => {
      if (viewMode === "promotion-form" && !editingId) {
        resetForm();
      }
    }, [editingId, viewMode]);

    useEffect(() => {
      if (!editingId || appliesToAll || packCategoryFilter || selectedPackIds.length === 0) return;
      const firstPack = packOptions.find((p) => p.id === selectedPackIds[0]);
      if (firstPack?.category) {
        setPackCategoryFilter(normalizePackCategory(firstPack.category));
      }
    }, [editingId, appliesToAll, packCategoryFilter, selectedPackIds, packOptions]);

    const handleSubmit = async () => {
      setFormError(null);
      const percent = Number(discountPercent);
      if (!Number.isFinite(percent) || percent < 1 || percent > 100 || !Number.isInteger(percent)) {
        setFormError("Pourcentage invalide (entier entre 1 et 100).");
        return;
      }
      if (!startsAt || !endsAt) {
        setFormError("Les dates de début et de fin sont obligatoires.");
        return;
      }
      if (!appliesToAll && selectedPackIds.length === 0) {
        setFormError("Sélectionnez au moins un pack ou cochez « Tous les packs ».");
        return;
      }

      const isEditMode = Boolean(editingId);
      setIsSubmitting(true);
      try {
        const response = await fetch(
          isEditMode ? `/api/admin/pack-promotions/${encodeURIComponent(editingId!)}` : "/api/admin/pack-promotions",
          {
            method: isEditMode ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label: label.trim() || undefined,
              appliesToAllPacks: appliesToAll,
              packIds: appliesToAll ? [] : selectedPackIds,
              discountPercent: percent,
              startsAt,
              endsAt,
              isActive,
            }),
          },
        );
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Enregistrement impossible.");
        }
        await syncAll();
        resetForm();
        onChangeViewMode("promotions");
        toast({
          variant: "success",
          title: isEditMode ? "Remise modifiée" : "Remise ajoutée",
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Une erreur est survenue.";
        setFormError(message);
        toast({ variant: "error", title: "Erreur", description: message });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleStartEdit = (item: AdminPackPromotionItem) => {
      setEditingId(item.id);
      setLabel(item.label ?? "");
      setAppliesToAll(item.appliesToAll);
      setSelectedPackIds(item.packIds);
      if (!item.appliesToAll && item.packIds.length > 0) {
        const firstPack = packOptions.find((p) => p.id === item.packIds[0]);
        setPackCategoryFilter(firstPack?.category ? normalizePackCategory(firstPack.category) : "");
      } else {
        setPackCategoryFilter("");
      }
      setDiscountPercent(String(item.discountValue));
      setStartsAt(item.startsAt);
      setEndsAt(item.endsAt);
      setIsActive(item.isActive);
      setFormError(null);
      onChangeViewMode("promotion-form");
    };

    const handleDelete = async () => {
      if (!promotionToDelete) return;
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/admin/pack-promotions/${encodeURIComponent(promotionToDelete.id)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Suppression impossible.");
        }
        setPromotionToDelete(null);
        await syncAll();
        toast({ variant: "success", title: "Remise supprimée" });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Une erreur est survenue.";
        toast({ variant: "error", title: "Erreur", description: message });
      } finally {
        setIsDeleting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh() {
        void syncAll();
      },
    }));

    const lifecycleBadgeClass = (lifecycle: AdminPackPromotionItem["lifecycle"]) => {
      if (lifecycle === "active") return "border border-emerald-200 bg-emerald-50 text-emerald-900";
      if (lifecycle === "upcoming") return "border border-sky-200 bg-sky-50 text-sky-900";
      if (lifecycle === "ended") return "border border-zinc-200 bg-zinc-50 text-zinc-700";
      return "border border-amber-200 bg-amber-50 text-amber-900";
    };

    return (
      <div className="space-y-6">
        {viewMode === "promotions" ? (
          isLoading && !promotionsLoaded ? (
            <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">
              Chargement...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
          ) : (
            <div className="rounded-2xl border border-brand-medium/20 bg-white">
              <div className="border-b border-brand-medium/20 px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-brand-dark">Remises sur les packs</p>
                    <p className="mt-1 text-xs text-brand-dark/60">{items.length} remise(s)</p>
                  </div>
                  <button
                    type="button"
                    onClick={onBackToPacks}
                    className="text-sm font-medium text-brand-dark/60 underline-offset-2 hover:text-brand-dark hover:underline"
                  >
                    Retour aux packs
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-brand-dark/60">Aucune remise pour le moment.</div>
              ) : (
                <>
                  <div className="divide-y divide-brand-medium/15 lg:hidden">
                    {items.map((item) => (
                      <article key={item.id} className="space-y-2 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-brand-dark">{item.label ?? "Remise"}</p>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${lifecycleBadgeClass(item.lifecycle)}`}
                          >
                            {promotionLifecycleLabelFr(item.lifecycle)}
                          </span>
                        </div>
                        <p className="text-xs text-brand-dark/75">
                          Portée : {item.scopeLabel}
                        </p>
                        <p className="text-xs text-brand-dark/75">Remise : −{item.discountValue} %</p>
                        <p className="text-xs text-brand-dark/75">
                          Période :{" "}
                          {formatPromotionPeriodFr(
                            new Date(`${item.startsAt}T12:00:00`),
                            new Date(`${item.endsAt}T12:00:00`),
                          )}
                        </p>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            aria-label="Modifier la remise"
                            title="Modifier"
                            className={`${promotionRowIconBtnClass} border-brand-medium/30 bg-brand-light/40 text-brand-dark focus-visible:ring-brand-medium/30`}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                              <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromotionToDelete(item)}
                            aria-label="Supprimer la remise"
                            title="Supprimer"
                            className={`${promotionRowIconBtnClass} border-red-200 bg-red-50 text-red-700 focus-visible:ring-red-200`}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                              <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                            </svg>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[820px]">
                      <thead>
                        <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-left text-xs font-semibold text-brand-dark/70">
                          <th className="px-5 py-3">Libellé</th>
                          <th className="px-4 py-3">Portée</th>
                          <th className="px-4 py-3">Remise</th>
                          <th className="px-4 py-3">Période</th>
                          <th className="px-4 py-3">Statut</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-medium/15">
                        {items.map((item) => (
                          <tr key={item.id} className="text-sm">
                            <td className="px-5 py-4 font-medium text-brand-dark">{item.label ?? "—"}</td>
                            <td className="px-4 py-4 text-brand-dark/80">
                              {item.scopeLabel}
                            </td>
                            <td className="px-4 py-4 font-semibold text-brand-dark">−{item.discountValue} %</td>
                            <td className="px-4 py-4 text-brand-dark/80">
                              {formatPromotionPeriodFr(
                            new Date(`${item.startsAt}T12:00:00`),
                            new Date(`${item.endsAt}T12:00:00`),
                          )}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${lifecycleBadgeClass(item.lifecycle)}`}
                              >
                                {promotionLifecycleLabelFr(item.lifecycle)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(item)}
                                  aria-label="Modifier la remise"
                                  title="Modifier"
                                  className={`${promotionRowIconBtnClass} border-brand-medium/30 bg-brand-light/40 text-brand-dark focus-visible:ring-brand-medium/30`}
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                    <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPromotionToDelete(item)}
                                  aria-label="Supprimer la remise"
                                  title="Supprimer"
                                  className={`${promotionRowIconBtnClass} border-red-200 bg-red-50 text-red-700 focus-visible:ring-red-200`}
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-brand-dark">
              {editingId ? "Modifier la remise" : "Ajouter une remise"}
            </h3>
            <p className="mt-2 text-sm text-brand-dark/70">
              Définissez le pourcentage et la période. Le prix après remise est calculé automatiquement.
            </p>

            <div className="mt-5 space-y-4">
              <Input
                id="promotion-label"
                label="Libellé (optionnel)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Soldes printemps"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  id="promotion-percent"
                  label="Remise (%)"
                  type="number"
                  min={1}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Ex: 15"
                />
                <DatePicker
                  id="promotion-starts"
                  label="Date de début"
                  value={startsAt}
                  onChange={setStartsAt}
                  placeholder="JJ/MM/AAAA"
                />
                <DatePicker
                  id="promotion-ends"
                  label="Date de fin"
                  value={endsAt}
                  onChange={setEndsAt}
                  placeholder="JJ/MM/AAAA"
                />
              </div>

              {!canPreviewPrices ? (
                <p className="text-xs text-brand-dark/60">
                  Renseignez le pourcentage et les dates pour afficher les prix après remise sur les packs.
                </p>
              ) : null}

              <Checkbox
                id="promotion-all-packs"
                label="Appliquer à tous les packs actifs"
                checked={appliesToAll}
                onChange={(e) => {
                  setAppliesToAll(e.target.checked);
                  if (e.target.checked) setSelectedPackIds([]);
                }}
              />

              {!appliesToAll ? (
                <div className="space-y-3">
                  <Select
                    id="promotion-pack-category"
                    label="Catégorie de pack"
                    value={packCategoryFilter}
                    onChange={(e) => setPackCategoryFilter(e.target.value)}
                  >
                    <option value="">— Sélectionner —</option>
                    {categoryOptionsInUse.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-dark">Packs concernés</p>
                    <p className="text-xs text-brand-dark/60">
                      {packCategoryFilter
                        ? `Packs « ${packCategoryMenuLabel(packCategoryFilter)} » — sélectionnez un ou plusieurs.`
                        : "Choisissez d'abord une catégorie pour afficher les packs correspondants."}
                    </p>
                    <div className="max-h-72 overflow-y-auto rounded-xl border border-brand-medium/25 bg-brand-light/20 p-3">
                      {!packCategoryFilter ? (
                        <p className="text-sm text-brand-dark/60">Sélectionnez une catégorie ci-dessus.</p>
                      ) : filteredPackOptions.length === 0 ? (
                        <p className="text-sm text-brand-dark/60">Aucun pack dans cette catégorie.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {filteredPackOptions.map((p) => {
                            const selected = selectedPackIds.includes(p.id);
                            const pricing = getPackCardPricing(p);
                            return (
                              <label
                                key={p.id}
                                className={`flex min-h-[5.5rem] cursor-pointer flex-col rounded-lg border p-2.5 text-left transition has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-medium/40 ${
                                  selected
                                    ? "border-brand-dark/35 bg-white shadow-sm ring-2 ring-brand-dark/15"
                                    : "border-brand-medium/25 bg-white hover:border-brand-medium/45 hover:bg-brand-light/40"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={selected}
                                  onChange={() => togglePackSelection(p.id)}
                                />
                                <div className="flex items-start justify-between gap-1">
                                  <p className="min-w-0 truncate text-sm font-semibold leading-tight text-brand-dark">
                                    {p.name}
                                  </p>
                                  {selected ? (
                                    <span
                                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-dark text-[9px] font-bold text-white"
                                      aria-hidden
                                    >
                                      ✓
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-auto pt-2">
                                  {p.priceCents == null ? (
                                    <p className="text-[11px] text-brand-dark/55">Prix non défini</p>
                                  ) : canPreviewPrices ? (
                                    <PackPriceDisplay
                                      pricing={pricing}
                                      size="sm"
                                      className="[&>div]:flex-col [&>div]:items-start [&>motion.div]:gap-0.5"
                                    />
                                  ) : (
                                    <p className="text-xs tabular-nums text-brand-dark/75">
                                      {formatPackPriceDt(p.priceCents)}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-brand-dark/70">
                      {selectedPackIds.length === 0
                        ? "Aucun pack sélectionné"
                        : `${selectedPackIds.length} pack${selectedPackIds.length > 1 ? "s" : ""} sélectionné${selectedPackIds.length > 1 ? "s" : ""}`}
                      {selectedOutsideFilterCount > 0
                        ? ` (${selectedOutsideFilterCount} dans une autre catégorie)`
                        : null}
                    </p>
                  </div>
                </div>
              ) : appliesToAll && canPreviewPrices ? (
                <p className="rounded-xl border border-brand-medium/25 bg-brand-light/30 px-4 py-3 text-sm text-brand-dark/75">
                  La remise de −{Math.round(Number(discountPercent))} % s&apos;appliquera à tous les packs actifs
                  pendant la période choisie.
                </p>
              ) : null}

              <Checkbox
                id="promotion-active"
                label="Remise active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />

              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onChangeViewMode("promotions");
                }}
                className="rounded-full border border-brand-medium/35 bg-white px-4 py-2.5 text-sm font-medium text-brand-dark"
              >
                Annuler
              </button>
              <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : editingId ? "Mettre à jour" : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={Boolean(promotionToDelete)}
          title="Supprimer cette remise ?"
          description={
            promotionToDelete
              ? `${promotionToDelete.scopeLabel} · −${promotionToDelete.discountValue} %`
              : undefined
          }
          confirmText="Supprimer"
          isConfirming={isDeleting}
          onClose={() => {
            if (!isDeleting) setPromotionToDelete(null);
          }}
          onConfirm={() => void handleDelete()}
        />
      </div>
    );
  },
);
