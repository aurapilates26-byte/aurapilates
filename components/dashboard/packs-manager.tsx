"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, Select, Textarea } from "@/components/ui";
import { PACK_CATEGORIES } from "@/lib/pack-categories";

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
  durationDays: number | null;
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
  const [priceCents, setPriceCents] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [isActive, setIsActive] = useState(true);

  const isMixedPack = category.trim() === "Pilates reformer + Mat pilates";
  const categoryLabel = (raw: string) => (raw === "Pilates reformer + Mat pilates" ? "Reformer + Mat" : raw);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.category ?? ""} ${item.name} ${item.features.join(" ")}`.toLowerCase();
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
    setPriceCents("");
    setDurationDays("");
    setIsActive(true);
    setFormError(null);
  };

  useEffect(() => {
    void loadPacks();
  }, []);

  useEffect(() => {
    if (viewMode === "form") {
      resetForm();
    }
  }, [viewMode]);

  const handleCreatePack = async () => {
    setFormError(null);
    if (!name.trim()) {
      setFormError("Le nom du pack est obligatoire.");
      return;
    }

    const isEditMode = Boolean(editingPackId);
    setIsSubmitting(true);
    try {
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
          priceCents: priceCents ? Number(priceCents) : undefined,
          durationDays: durationDays ? Number(durationDays) : undefined,
          isActive,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Creation du pack impossible.");
      }

      await loadPacks();
      onChangeViewMode("list");
      resetForm();
      toast({
        variant: "success",
        title: isEditMode ? "Pack modifie" : "Pack ajoute",
        description: isEditMode
          ? "Les informations du pack ont ete mises a jour."
          : "Le nouveau pack a ete enregistre avec succes.",
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
    setCategory(item.category ?? "");
    setName(item.name);
    setDescription(item.description ?? item.features.join("\n"));
    setSessionCount(item.sessionCount !== null ? String(item.sessionCount) : "");
    const reformer = item.courseQuotas?.find((q) => q.courseSlug === "pilates-reformer")?.sessionCount ?? null;
    const mat = item.courseQuotas?.find((q) => q.courseSlug === "mat-pilates")?.sessionCount ?? null;
    setReformerSessions(reformer !== null ? String(reformer) : "");
    setMatSessions(mat !== null ? String(mat) : "");
    setPriceCents(item.priceCents !== null ? String(item.priceCents) : "");
    setDurationDays(item.durationDays !== null ? String(item.durationDays) : "");
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
        title: "Pack supprime",
        description: "Le pack a ete supprime avec succes.",
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
                  <p className="mt-1 text-xs text-brand-dark/60">{visibleItems.length} resultat(s)</p>
                </div>
                <div className="w-full md:max-w-md">
                  <Input
                    id="packs-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nom, categorie, point..."
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
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            item.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                          }`}
                        >
                          {item.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-dark/75">Categorie: {item.category ?? "—"}</p>
                      <p className="text-xs text-brand-dark/75">
                        Seances: {item.sessionCount !== null ? item.sessionCount : "—"}
                      </p>
                      <p className="text-xs text-brand-dark/75">
                        Duree: {item.durationDays !== null ? `${item.durationDays} jours` : "—"}
                      </p>
                      <p className="text-xs text-brand-dark/75">
                        Prix: {item.priceCents !== null ? `${(item.priceCents / 100).toFixed(2)} TND` : "—"}
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
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-left text-xs font-semibold text-brand-dark/70">
                        <th className="px-5 py-3">Categorie</th>
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Points du pack</th>
                        <th className="px-4 py-3">Seances</th>
                        <th className="px-4 py-3">Prix</th>
                        <th className="px-4 py-3">Duree</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Adherents</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-medium/15">
                      {visibleItems.map((item) => (
                        <tr key={item.id} className="text-sm">
                          <td className="px-5 py-4 text-brand-dark/80">{item.category ?? "—"}</td>
                          <td className="px-4 py-4 font-semibold text-brand-dark">{item.name}</td>
                          <td className="px-4 py-4 text-brand-dark/80">
                            {item.features.length > 0 ? item.features.join(" - ") : "—"}
                          </td>
                          <td className="px-4 py-4 text-brand-dark/80">{item.sessionCount ?? "—"}</td>
                          <td className="px-4 py-4 text-brand-dark/80">
                            {item.priceCents !== null ? `${(item.priceCents / 100).toFixed(2)} TND` : "—"}
                          </td>
                          <td className="px-4 py-4 text-brand-dark/80">
                            {item.durationDays !== null ? `${item.durationDays} jours` : "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                item.isActive
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                              }`}
                            >
                              {item.isActive ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-brand-dark/80">{item._count.members}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
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
                label="Categorie"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">— Selectionner —</option>
                {PACK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
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
                  label="Seances Reformer"
                  type="number"
                  min={1}
                  value={reformerSessions}
                  onChange={(event) => setReformerSessions(event.target.value)}
                  placeholder="Ex: 5"
                />
                <Input
                  id="pack-sessions-mat"
                  label="Seances Mat"
                  type="number"
                  min={1}
                  value={matSessions}
                  onChange={(event) => setMatSessions(event.target.value)}
                  placeholder="Ex: 5"
                />
                <Input
                  id="pack-sessions-total"
                  label="Total de seances (auto)"
                  type="number"
                  value={(Number(reformerSessions || 0) + Number(matSessions || 0)).toString()}
                  disabled
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  id="pack-price"
                  label="Prix (en centimes)"
                  type="number"
                  min={0}
                  value={priceCents}
                  onChange={(event) => setPriceCents(event.target.value)}
                  placeholder="Ex: 12000"
                />
                <Input
                  id="pack-sessions"
                  label="Nombre de seances"
                  type="number"
                  min={1}
                  value={sessionCount}
                  onChange={(event) => setSessionCount(event.target.value)}
                  placeholder="Ex: 3"
                />
                <Input
                  id="pack-duration"
                  label="Duree (jours)"
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(event) => setDurationDays(event.target.value)}
                  placeholder="Ex: 30"
                />
              </div>
            )}

            {isMixedPack ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="pack-price"
                  label="Prix (en centimes)"
                  type="number"
                  min={0}
                  value={priceCents}
                  onChange={(event) => setPriceCents(event.target.value)}
                  placeholder="Ex: 12000"
                />
                <Input
                  id="pack-duration"
                  label="Duree (jours)"
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(event) => setDurationDays(event.target.value)}
                  placeholder="Ex: 30"
                />
              </div>
            ) : null}

            <Textarea
              id="pack-description"
              label="Description (un point par ligne)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              placeholder={"3 seances\n30 jours\n2 seances gratuites"}
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
              {isSubmitting ? "Enregistrement..." : editingPackId ? "Mettre a jour" : "Enregistrer"}
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(packToDelete)}
        title="Supprimer ce pack ?"
        description={
          packToDelete
            ? `Cette action supprimera le pack "${packToDelete.name}" de maniere definitive.`
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
