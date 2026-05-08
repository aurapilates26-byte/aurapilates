"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, Checkbox, ConfirmDialog, Input, Textarea } from "@/components/ui";
import { useCoachStore } from "@/store";
import type { AdminCoach } from "@/types/admin/coach";

export type CoachesManagerHandle = {
  refresh: () => void;
};

type CoachesResponse = {
  items: AdminCoach[];
};

type CoachesManagerProps = {
  viewMode: "list" | "form";
  onChangeViewMode: (mode: "list" | "form") => void;
};

export const CoachesManager = forwardRef<CoachesManagerHandle, CoachesManagerProps>(function CoachesManagerWithRef(
  { viewMode, onChangeViewMode },
  ref
) {
  const { toast } = useToast();
  const {
    items,
    filters,
    isLoading,
    error,
    setItems,
    setLoading,
    setError,
    setSearch,
    setStatus,
    resetFilters,
  } = useCoachStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
  const [coachToDelete, setCoachToDelete] = useState<AdminCoach | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const visibleItems = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return items.filter((item) => {
      const statusOk =
        filters.status === "ALL" ? true : filters.status === "ACTIVE" ? item.isActive : !item.isActive;
      if (!statusOk) return false;
      if (!q) return true;
      const haystack =
        `${item.firstName} ${item.lastName} ${item.email ?? ""} ${item.phone ?? ""} ${item.description ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filters.search, filters.status, items]);

  const loadCoaches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/coaches", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les coachs.");
      }
      const data = (await response.json()) as CoachesResponse;
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCoachId(null);
    setImageUrl("");
    setAvatarFile(null);
    setFirstName("");
    setLastName("");
    setDescription("");
    setEmail("");
    setPhone("");
    setIsActive(true);
    setFormError(null);
  };

  useEffect(() => {
    void loadCoaches();
  }, []);

  useEffect(() => {
    if (viewMode === "form" && !editingCoachId) {
      resetForm();
    }
  }, [editingCoachId, viewMode]);

  const handleSubmit = async () => {
    setFormError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setFormError("Nom et prenom sont obligatoires.");
      return;
    }
    if (email.trim() && !isValidEmail(email.trim())) {
      setFormError("Email invalide. Exemple: coach@aurapilates.tn");
      return;
    }

    const isEditMode = Boolean(editingCoachId);
    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl.trim() || undefined;
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", avatarFile);
        const uploadResponse = await fetch("/api/admin/coaches/upload", {
          method: "POST",
          body: uploadFormData,
        });
        if (!uploadResponse.ok) {
          const uploadData = (await uploadResponse.json().catch(() => null)) as { error?: string } | null;
          throw new Error(uploadData?.error ?? "Upload avatar impossible.");
        }
        const uploadData = (await uploadResponse.json()) as { imageUrl: string };
        finalImageUrl = uploadData.imageUrl;
      }

      const response = await fetch(isEditMode ? `/api/admin/coaches/${encodeURIComponent(editingCoachId!)}` : "/api/admin/coaches", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          description: description.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          isActive,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Enregistrement du coach impossible.");
      }

      await loadCoaches();
      resetForm();
      onChangeViewMode("list");
      toast({
        variant: "success",
        title: isEditMode ? "Coach modifie" : "Coach ajoute",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setFormError(message);
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (coach: AdminCoach) => {
    setEditingCoachId(coach.id);
    setAvatarFile(null);
    setImageUrl(coach.imageUrl ?? "");
    setFirstName(coach.firstName);
    setLastName(coach.lastName);
    setDescription(coach.description ?? "");
    setEmail(coach.email ?? "");
    setPhone(coach.phone ?? "");
    setIsActive(coach.isActive);
    setFormError(null);
    onChangeViewMode("form");
  };

  const handleDelete = async () => {
    if (!coachToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/coaches/${encodeURIComponent(coachToDelete.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Suppression impossible.");
      }
      setCoachToDelete(null);
      await loadCoaches();
      toast({ variant: "success", title: "Coach supprime" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePickAvatar = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Veuillez choisir une image valide.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError("L'image depasse 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(typeof reader.result === "string" ? reader.result : "");
      setAvatarFile(file);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  useImperativeHandle(ref, () => ({
    refresh() {
      void loadCoaches();
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-brand-dark">Liste des coachs</p>
                    <p className="mt-1 text-xs text-brand-dark/60">{visibleItems.length} resultat(s)</p>
                  </div>
                  <div className="grid min-w-0 w-full gap-2 md:max-w-2xl md:grid-cols-[minmax(320px,1fr)_180px_42px] md:items-end">
                    <Input
                      id="coaches-search"
                      value={filters.search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Nom, email, telephone..."
                      className="mt-0 py-2.5"
                    />
                    <select
                      aria-label="Filtrer par statut"
                      title="Filtrer par statut"
                      value={filters.status}
                      onChange={(event) => setStatus(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
                      className="h-[42px] rounded-xl border border-brand-medium/30 bg-white px-3 text-sm text-brand-dark outline-none transition focus:border-brand-dark/60"
                    >
                      <option value="ALL">Tous</option>
                      <option value="ACTIVE">Actifs</option>
                      <option value="INACTIVE">Inactifs</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => resetFilters()}
                      aria-label="Reinitialiser les filtres"
                      title="Reinitialiser"
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {visibleItems.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-brand-dark/60">Aucun coach pour le moment.</div>
            ) : (
              <>
                <div className="divide-y divide-brand-medium/15 lg:hidden">
                  {visibleItems.map((coach) => (
                    <article key={coach.id} className="space-y-2 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-zinc-50">
                            {coach.imageUrl ? (
                              <img
                                src={coach.imageUrl}
                                alt={`${coach.firstName} ${coach.lastName}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-brand-dark/60">
                                {(coach.firstName[0] ?? "").toUpperCase()}
                                {(coach.lastName[0] ?? "").toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="truncate font-semibold text-brand-dark">
                            {coach.firstName} {coach.lastName}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            coach.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                          }`}
                        >
                          {coach.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-dark/75">Email: {coach.email ?? "—"}</p>
                      <p className="text-xs text-brand-dark/75">Tel: {coach.phone ?? "—"}</p>
                      <p className="text-xs text-brand-dark/75">Description: {coach.description ?? "—"}</p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(coach)}
                          className="rounded-full border border-brand-medium/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark/80 transition hover:bg-zinc-50"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoachToDelete(coach)}
                          className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[980px]">
                    <thead>
                      <tr className="border-b border-brand-medium/15 bg-zinc-50/60 text-left text-xs font-semibold text-brand-dark/70">
                        <th className="px-5 py-3">Coach</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Telephone</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-medium/15">
                      {visibleItems.map((coach) => (
                        <tr key={coach.id} className="text-sm">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-zinc-50">
                                {coach.imageUrl ? (
                                  <img
                                    src={coach.imageUrl}
                                    alt={`${coach.firstName} ${coach.lastName}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-brand-dark/60">
                                    {(coach.firstName[0] ?? "").toUpperCase()}
                                    {(coach.lastName[0] ?? "").toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <p className="font-semibold text-brand-dark">
                                {coach.firstName} {coach.lastName}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-brand-dark/80">{coach.email ?? "—"}</td>
                          <td className="px-4 py-4 text-brand-dark/80">{coach.phone ?? "—"}</td>
                          <td className="px-4 py-4 text-brand-dark/80">{coach.description ?? "—"}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                coach.isActive
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border border-zinc-200 bg-zinc-50 text-zinc-800"
                              }`}
                            >
                              {coach.isActive ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(coach)}
                                className="rounded-full border border-brand-medium/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark/80 transition hover:bg-zinc-50"
                              >
                                Modifier
                              </button>
                              <button
                                type="button"
                                onClick={() => setCoachToDelete(coach)}
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
          <h3 className="text-xl font-semibold text-brand-dark">{editingCoachId ? "Modifier coach" : "Ajouter coach"}</h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            Ajoutez les informations du coach avec un formulaire harmonise au dashboard.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-brand-dark">Avatar</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePickAvatar}
                  className="h-16 w-16 overflow-hidden rounded-full border border-brand-medium/30 bg-zinc-50"
                  title="Choisir une image"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Apercu avatar coach" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-brand-dark/60">+</span>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePickAvatar}
                    className="rounded-full border border-brand-medium/35 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-zinc-50"
                  >
                    Choisir image
                  </button>
                  {imageUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setAvatarFile(null);
                      }}
                      className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Retirer
                    </button>
                  ) : null}
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                aria-label="Choisir une image avatar"
                title="Choisir une image avatar"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="coach-first-name"
                label="Prenom"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Ex: Sara"
              />
              <Input
                id="coach-last-name"
                label="Nom"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Ex: Ben Ali"
              />
              <Input
                id="coach-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="coach@aurapilates.tn"
              />
              <Input
                id="coach-phone"
                label="Telephone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Ex: +216 22 000 000"
              />
            </div>

            <Textarea
              id="coach-description"
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Ex: Coach Pilates reformer, specialisee post-partum..."
            />

            <Checkbox
              id="coach-active"
              label="Coach actif"
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
            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : editingCoachId ? "Mettre a jour" : "Enregistrer"}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(coachToDelete)}
        title="Supprimer ce coach ?"
        description={
          coachToDelete
            ? `Cette action supprimera ${coachToDelete.firstName} ${coachToDelete.lastName} de maniere definitive.`
            : undefined
        }
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setCoachToDelete(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
});
