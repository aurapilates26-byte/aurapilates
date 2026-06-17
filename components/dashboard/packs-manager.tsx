"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, Select, Textarea } from "@/components/ui";
import { PACK_CATEGORY_OPTIONS, normalizePackCategory, packCategoryMenuLabel } from "@/lib/pack-categories";
import { formatPackDurationLabel, splitPackDurationForForm, type PackDurationUnit } from "@/lib/pack-duration";
import { formatPackPriceDt } from "@/lib/public-pack-display";

const PACK_DURATION_INPUT_CLASS =
  "min-w-0 flex-1 rounded-xl border border-brand-medium/30 bg-white px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/45 focus:border-brand-dark/60";
const PACK_DURATION_SELECT_CLASS =
  "w-[120px] shrink-0 rounded-xl border border-brand-medium/30 bg-white px-3 py-3 text-sm text-brand-dark outline-none focus:border-brand-dark/60";

export type PacksManagerHandle = {
  refresh: () => void;
};

type PackItem = {
  id: string;
  category: string | null;
  name: string;
  description: string | null;
  sessionCount: number | null;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
  priceCents: number | null;
  durationDays: string | null;
  isActive: boolean;
  features: string[];
  _count: { members: number };
};

type PacksResponse = {
  items: PackItem[];
};

type PacksManagerProps = {
  viewMode: "list" | "form";
  onChangeViewMode: (mode: "list" | "form") => void;
};

export const PacksManager = forwardRef<PacksManagerHandle, PacksManagerProps>(function PacksManagerWithRef(
  { viewMode, onChangeViewMode },
  ref
) {
  const { toast } = useToast();
  const [items, setItems] = useState<PackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [packToDelete, setPackToDelete] = useState<PackItem | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionCount, setSessionCount] = useState("");
  const [reformerSessions, setReformerSessions] = useState("");
  const [matSessions, setMatSessions] = useState("");
  const [priceDinars, setPriceDinars] = useState("");
  const [durationAmount, setDurationAmount] = useState("");
  const [durationUnit, setDurationUnit] = useState<PackDurationUnit>("jours");
  const [isActive, setIsActive] = useState(true);

  const isMixedPack = category.trim() === "Pilates reformer + Mat pilates";

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack =
        `${packCategoryMenuLabel(item.category)} ${item.category ?? ""} ${item.name} ${item.features.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search]);

  const loadPacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/packs", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les packs.");
      }
      const data = (await response.json()) as PacksResponse;
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPackId(null);
    setCategory("");
    setName("");
    setDescription("");
    setSessionCount("");
    setReformerSessions("");
    setMatSessions("");
    setPriceDinars("");
    setDurationAmount("");
    setDurationUnit("jours");
    setIsActive(true);
    setFormError(null);
  };

  useEffect(() => {
    void loadPacks();
  }, []);

  useEffect(() => {
    if (viewMode === "form" && !editingPackId) {
      resetForm();
    }
  }, [viewMode, editingPackId]);

  const handleCreatePack = async () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError("Le nom du pack est obligatoire.");
      return;
    }

    const isEditMode = Boolean(editingPackId);
    setIsSubmitting(true);
    try {
      let pricePayload: number | undefined;
      if (priceDinars.trim() === "") {
        pricePayload = undefined;
      } else {
        const t = priceDinars.trim().replace(/\s/g, "").replace(",", ".");
        const n = Number(t);
        if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
          setFormError("Prix invalide : nombre entier en dinars (ex. 100).");
          return;
        }
        pricePayload = n;
      }

      let durationPayload: string | null = null;
      if (durationAmount.trim() !== "") {
        const n = Number(durationAmount.trim());
        if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) {
          setFormError("Durée invalide : nombre entier positif.");
          return;
        }
        durationPayload = formatPackDurationLabel(n, durationUnit);
      }

      const response = await fetch(isEditMode ? `/api/admin/packs/${encodeURIComponent(editingPackId!)}` : "/api/admin/packs", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.trim() || undefined,
          name: name.trim(),
          description: description.trim() || undefined,
          sessionCount:
            category.trim() === "Pilates reformer + Mat pilates" ? undefined : sessionCount ? Number(sessionCount) : undefined,
          courseQuotas:
            category.trim() === "Pilates reformer + Mat pilates"
              ? {
                  "pilates-reformer": reformerSessions ? Number(reformerSessions) : undefined,
                  "mat-pilates": matSessions ? Number(matSessions) : undefined,
                }
              : undefined,
          priceCents: pricePayload,
          durationDays: durationPayload,
          isActive,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Création du pack impossible.");
      }

      await loadPacks();
      onChangeViewMode("list");
      resetForm();
      toast({
        variant: "success",
        title: isEditMode ? "Pack modifié" : "Pack ajouté",
        description: isEditMode
          ? "Les informations du pack ont été mises à jour."
          : "Le nouveau pack a été enregistré avec succès.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setFormError(message);
      toast({
        variant: "error",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditPack = (item: PackItem) => {
    setEditingPackId(item.id);
    setCategory(item.category ? normalizePackCategory(item.category) : "");
    setName(item.name);
    setDescription(item.description ?? item.features.join("\n"));
    setSessionCount(item.sessionCount !== null ? String(item.sessionCount) : "");
    const reformer = item.courseQuotas?.find((q) => q.courseSlug === "pilates-reformer")?.sessionCount ?? null;
    const mat = item.courseQuotas?.find((q) => q.courseSlug === "mat-pilates")?.sessionCount ?? null;
    setReformerSessions(reformer !== null ? String(reformer) : "");
    setMatSessions(mat !== null ? String(mat) : "");
    setPriceDinars(item.priceCents != null ? String(item.priceCents) : "");
    const { amount, unit } = splitPackDurationForForm(item.durationDays);
    setDurationAmount(amount);
    setDurationUnit(unit);
    setIsActive(item.isActive);
    setFormError(null);
    onChangeViewMode("form");
  };

  const handleDeletePack = async () => {
    if (!packToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/packs/${encodeURIComponent(packToDelete.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Suppression du pack impossible.");
      }
      setPackToDelete(null);
      await loadPacks();
      toast({
        variant: "success",
        title: "Pack supprimé",
        description: "Le pack a été supprimé avec succès.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({
        variant: "error",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh() {
      void loadPacks();
    },
  }));

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        isLoading ? (
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">Chargement...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : (
          <div className="rounded-2xl border border-brand-medium/20 bg-white">
            <div className="border-b border-brand-medium/20 px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-base font-semibold text-brand-dark">Liste des packs</p>
                  <p className="mt-1 text-xs text-brand-dark/60">{visibleItems.length} résultat(s)</p>
                </div>
                <div className="w-full md:max-w-md">
                  <Input
                    id="packs-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nom, catégorie, point..."
                    className="mt-0 py-2.5"
                  />
                </div>
              </div>
            </div>

            {visibleItems.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-brand-dark/60">Aucun pack pour le moment.</div>
            ) : (
              <>
                <div className="divide-y divide-brand-medium/15 lg:hidden">
                  {visibleItems.map((item) => (
                    <article key={item.id} className="space-y-2 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-brand-dark">{item.name}</p>
                      </div>
                      <p className="text-xs text-brand-dark/75">Catégorie : {packCategoryMenuLabel(item.category)}</p>
                      <p className="text-xs text-brand-dark/75">
                        Séances : {item.sessionCount !== null ? item.sessionCount : "—"}
                      </p>
                      <p className="text-xs text-brand-dark/75">
                        Duree: {item.durationDays != null && item.durationDays !== "" ? item.durationDays : "—"}
                      </p>
                      <p className="text-xs text-brand-dark/75">
                        Prix: {item.priceCents != null ? formatPackPriceDt(item.priceCents) : "—"}
                      </p>
                      <p className="text-xs text-brand-dark/75">
                        Points: {item.features.length > 0 ? item.features.join(" - ") : "—"}
                      </p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditPack(item)}
                          className="rounded-full border border-brand-medium/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark/80 transition hover:bg-zinc-50"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setPackToDelete(item)}
                          className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[780px]">
                    <thead>
                      <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-xs font-semibold text-brand-dark/70">
                        <th className="px-5 py-3 text-left">Catégorie</th>
                        <th className="px-4 py-3 text-center">Nom</th>
                        <th className="px-4 py-3 text-center">Séances</th>
                        <th className="px-4 py-3 text-center">Prix</th>
                        <th className="px-4 py-3 text-center">Duree</th>
                        <th className="px-4 py-3 text-center">Adherents</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-medium/15">
                      {visibleItems.map((item) => (
                        <tr key={item.id} className="text-sm">
                          <td className="px-5 py-4 text-left text-brand-dark/80">{packCategoryMenuLabel(item.category)}</td>
                          <td className="px-4 py-4 text-center font-semibold text-brand-dark">{item.name}</td>
                          <td className="px-4 py-4 text-center text-brand-dark/80">{item.sessionCount ?? "—"}</td>
                          <td className="px-4 py-4 text-center text-brand-dark/80">
                            {item.priceCents != null ? formatPackPriceDt(item.priceCents) : "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-brand-dark/80">
                            {item.durationDays != null && item.durationDays !== "" ? item.durationDays : "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-brand-dark/80">{item._count?.members ?? 0}</td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditPack(item)}
                                aria-label="Modifier"
                                title="Modifier"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-white text-brand-dark/80 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                                  <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l9.06-9.06.92.92L5.92 20.08zM20.7 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPackToDelete(item)}
                                aria-label="Supprimer"
                                title="Supprimer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
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
          <h3 className="text-xl font-semibold text-brand-dark">{editingPackId ? "Modifier le pack" : "Ajouter un pack"}</h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            Saisissez la description avec un point par ligne pour conserver une structure claire et reutilisable.
          </p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                id="pack-category"
                label="Catégorie"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">— Sélectionner —</option>
                {PACK_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <Input
                id="pack-name"
                label="Nom du pack"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Start"
              />
            </div>
            {isMixedPack ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  id="pack-sessions-reformer"
                  label="Séances Reformer"
                  type="number"
                  min={1}
                  value={reformerSessions}
                  onChange={(event) => setReformerSessions(event.target.value)}
                  placeholder="Ex: 5"
                />
                <Input
                  id="pack-sessions-mat"
                  label="Séances Mat"
                  type="number"
                  min={1}
                  value={matSessions}
                  onChange={(event) => setMatSessions(event.target.value)}
                  placeholder="Ex: 5"
                />
                <Input
                  id="pack-sessions-total"
                  label="Total de séances (auto)"
                  type="number"
                  value={(Number(reformerSessions || 0) + Number(matSessions || 0)).toString()}
                  disabled
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  id="pack-price-single"
                  label="Prix"
                  type="number"
                  min={0}
                  step={1}
                  value={priceDinars}
                  onChange={(event) => setPriceDinars(event.target.value)}
                  placeholder="Ex: 100"
                />
                <Input
                  id="pack-sessions"
                  label="Nombre de séances"
                  type="number"
                  min={1}
                  value={sessionCount}
                  onChange={(event) => setSessionCount(event.target.value)}
                  placeholder="Ex: 3"
                />
                <div className="min-w-0">
                  <label htmlFor="pack-duration-amount" className="text-sm font-medium text-brand-dark">
                    Duree
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="pack-duration-amount"
                      type="number"
                      min={1}
                      step={1}
                      value={durationAmount}
                      onChange={(event) => setDurationAmount(event.target.value)}
                      placeholder="Ex: 30"
                      className={PACK_DURATION_INPUT_CLASS}
                    />
                    <select
                      id="pack-duration-unit"
                      aria-label="Unité durée"
                      value={durationUnit}
                      onChange={(event) => setDurationUnit(event.target.value as PackDurationUnit)}
                      className={PACK_DURATION_SELECT_CLASS}
                    >
                      <option value="jours">jours</option>
                      <option value="mois">mois</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {isMixedPack ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="pack-price-mixed"
                  label="Prix"
                  type="number"
                  min={0}
                  step={1}
                  value={priceDinars}
                  onChange={(event) => setPriceDinars(event.target.value)}
                  placeholder="Ex: 100"
                />
                <div className="min-w-0">
                  <label htmlFor="pack-duration-amount-mixed" className="text-sm font-medium text-brand-dark">
                    Duree
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="pack-duration-amount-mixed"
                      type="number"
                      min={1}
                      step={1}
                      value={durationAmount}
                      onChange={(event) => setDurationAmount(event.target.value)}
                      placeholder="Ex: 30"
                      className={PACK_DURATION_INPUT_CLASS}
                    />
                    <select
                      id="pack-duration-unit-mixed"
                      aria-label="Unité durée"
                      value={durationUnit}
                      onChange={(event) => setDurationUnit(event.target.value as PackDurationUnit)}
                      className={PACK_DURATION_SELECT_CLASS}
                    >
                      <option value="jours">jours</option>
                      <option value="mois">mois</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            <Textarea
              id="pack-description"
              label="Description (un point par ligne)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              placeholder={"3 séances\n30 jours\n2 séances gratuites"}
            />

            <Checkbox
              id="pack-active"
              label="Pack actif"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
          </div>

          {formError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onChangeViewMode("list");
              }}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
            >
              Annuler
            </button>
            <Button onClick={() => void handleCreatePack()} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : editingPackId ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(packToDelete)}
        title="Supprimer ce pack ?"
        description={
          packToDelete
            ? `Cette action supprimera le pack « ${packToDelete.name} » de manière définitive.`
            : undefined
        }
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setPackToDelete(null);
        }}
        onConfirm={() => void handleDeletePack()}
      />
    </div>
  );
});
