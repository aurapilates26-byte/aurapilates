"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, ConfirmDialog, Input, SelectMenu } from "@/components/ui";
import { PlanningSessionCard } from "@/components/dashboard/planning-session-card";
import { usePlanningStore } from "@/store";
import type { AdminCoach } from "@/types/admin/coach";
import type { AdminPlanningItem, PlanningDayOfWeek, PlanningLevel } from "@/types/admin/planning";

export type PlanningManagerHandle = {
  refresh: () => void;
};

type PlanningResponse = {
  items: AdminPlanningItem[];
};

type PlanningManagerProps = {
  viewMode: "list" | "form";
  onChangeViewMode: (mode: "list" | "form") => void;
};

const courseOptions = [
  { value: "pilates-reformer", label: "Pilates reformer" },
  { value: "mat-pilates", label: "Mat pilates" },
  { value: "yoga", label: "Yoga" },
  { value: "dance", label: "Dance" },
] as const;

const courseLabelBySlug = courseOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const dayLabels: Record<PlanningDayOfWeek, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

const levelLabels: Record<PlanningLevel, string> = {
  ALL_LEVELS: "Tous niveaux",
  BEGINNER: "Debutant",
  INTERMEDIATE: "Intermediaire",
  ADVANCED: "Avance",
};

const orderedDays: PlanningDayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function levelBadgeClass(level: PlanningLevel) {
  if (level === "BEGINNER") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (level === "INTERMEDIATE") return "border-sky-200 bg-sky-50 text-sky-900";
  if (level === "ADVANCED") return "border-violet-200 bg-violet-50 text-violet-900";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

function todayPlanningDay(): PlanningDayOfWeek {
  const jsDay = new Date().getDay();
  if (jsDay === 1) return "MON";
  if (jsDay === 2) return "TUE";
  if (jsDay === 3) return "WED";
  if (jsDay === 4) return "THU";
  if (jsDay === 5) return "FRI";
  if (jsDay === 6) return "SAT";
  return "SUN";
}

export const PlanningManager = forwardRef<PlanningManagerHandle, PlanningManagerProps>(function PlanningManagerWithRef(
  { viewMode, onChangeViewMode },
  ref
) {
  const { toast } = useToast();
  const { items, filters, isLoading, error, setItems, setLoading, setError, setSearch, setDayOfWeek, resetFilters } =
    usePlanningStore();

  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminPlanningItem | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanningDayOfWeek>(() => todayPlanningDay());

  const [courseSlug, setCourseSlug] = useState<string>("NONE");
  const [coachId, setCoachId] = useState<string>("NONE");
  const [dayOfWeek, setDayOfWeekLocal] = useState<"NONE" | PlanningDayOfWeek>("NONE");
  const [level, setLevel] = useState<PlanningLevel>("ALL_LEVELS");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [capacity, setCapacity] = useState("");
  const [waitlistCapacity, setWaitlistCapacity] = useState("");

  const visibleItems = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return items.filter((item) => {
      if (!q) return true;
      const coachName = item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : "";
      const haystack = `${item.courseSlug} ${coachName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filters.search, items]);

  const visibleItemsByDay = useMemo(
    () =>
      visibleItems
        .filter((item) => item.dayOfWeek === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDay, visibleItems]
  );

  const loadPlanning = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/planning", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger le planning.");
      }
      const data = (await response.json()) as PlanningResponse;
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const loadCoaches = async () => {
    const response = await fetch("/api/admin/coaches", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { items: AdminCoach[] };
    setCoaches(data.items.filter((c) => c.isActive));
  };

  const resetForm = () => {
    setEditingId(null);
    setCourseSlug("NONE");
    setCoachId("NONE");
    setDayOfWeekLocal("NONE");
    setLevel("ALL_LEVELS");
    setStartTime("");
    setEndTime("");
    setDurationMinutes("");
    setCapacity("");
    setWaitlistCapacity("");
    setFormError(null);
  };

  useEffect(() => {
    void loadPlanning();
    void loadCoaches();
  }, []);

  useEffect(() => {
    if (viewMode === "form" && !editingId) {
      resetForm();
    }
  }, [editingId, viewMode]);

  const handleSubmit = async () => {
    setFormError(null);
    if (courseSlug === "NONE") {
      setFormError("Veuillez choisir un cours.");
      return;
    }
    if (dayOfWeek === "NONE") {
      setFormError("Veuillez choisir le jour.");
      return;
    }
    if (!startTime) {
      setFormError("Heure de debut invalide.");
      return;
    }
    if (!endTime) {
      setFormError("Heure de fin invalide.");
      return;
    }
    const duration = Number(durationMinutes);
    const cap = Number(capacity);
    const waitCap = waitlistCapacity.trim() ? Number(waitlistCapacity) : null;

    if (!Number.isFinite(duration) || duration < 10) {
      setFormError("La duree doit etre au moins 10 minutes.");
      return;
    }
    if (endTime <= startTime) {
      setFormError("L'heure de fin doit etre apres l'heure de debut.");
      return;
    }
    if (!Number.isFinite(cap) || cap < 1) {
      setFormError("Capacite invalide.");
      return;
    }
    if (waitCap !== null && (!Number.isFinite(waitCap) || waitCap < 0)) {
      setFormError("Liste d'attente invalide.");
      return;
    }

    const isEditMode = Boolean(editingId);
    setIsSubmitting(true);
    try {
      const response = await fetch(isEditMode ? `/api/admin/planning/${encodeURIComponent(editingId!)}` : "/api/admin/planning", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: courseSlug.trim(),
          coachId: coachId === "NONE" ? undefined : coachId,
          dayOfWeek: dayOfWeek as PlanningDayOfWeek,
          level,
          startTime,
          endTime,
          durationMinutes: duration,
          capacity: cap,
          waitlistCapacity: waitCap === null ? undefined : waitCap,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Enregistrement impossible.");
      }
      await loadPlanning();
      resetForm();
      onChangeViewMode("list");
      toast({
        variant: "success",
        title: isEditMode ? "Seance modifiee" : "Seance ajoutee",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setFormError(message);
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (item: AdminPlanningItem) => {
    setEditingId(item.id);
    setCourseSlug(item.courseSlug);
    setCoachId(item.coach?.id ?? "NONE");
    setDayOfWeekLocal(item.dayOfWeek);
    setLevel(item.level);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setDurationMinutes(String(item.durationMinutes));
    setCapacity(String(item.capacity));
    setWaitlistCapacity(item.waitlistCapacity !== null ? String(item.waitlistCapacity) : "");
    setFormError(null);
    onChangeViewMode("form");
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/planning/${encodeURIComponent(itemToDelete.id)}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Suppression impossible.");
      }
      setItemToDelete(null);
      await loadPlanning();
      toast({ variant: "success", title: "Seance supprimee" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh() {
      void loadPlanning();
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
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-base font-semibold text-brand-dark">Planning</p>
                  <p className="mt-1 text-xs text-brand-dark/60">
                    {visibleItemsByDay.length} resultat(s) — {dayLabels[selectedDay]}
                  </p>
                </div>
                <div className="grid min-w-0 w-full gap-2 md:max-w-3xl md:grid-cols-[minmax(320px,1fr)_42px] md:items-end">
                  <Input
                    id="planning-search"
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cours, coach..."
                    className="mt-0 py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      resetFilters();
                      setSelectedDay(todayPlanningDay());
                    }}
                    aria-label="Reinitialiser les filtres"
                    title="Reinitialiser"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {orderedDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day);
                      setDayOfWeek(day);
                    }}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition sm:px-3 sm:py-1 sm:text-xs lg:text-sm ${
                      selectedDay === day
                        ? "border-brand-dark/30 bg-brand-dark text-white"
                        : "border-brand-medium/35 bg-white text-brand-dark/80 hover:bg-zinc-50"
                    }`}
                  >
                    {dayLabels[day].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {visibleItemsByDay.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-brand-dark/60">Aucune seance planifiee.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 sm:p-5 lg:grid-cols-3">
                {visibleItemsByDay.map((item) => (
                  <PlanningSessionCard
                    key={item.id}
                    courseLabel={courseLabelBySlug[item.courseSlug] ?? item.courseSlug}
                    startTime={item.startTime}
                    levelLabel={levelLabels[item.level]}
                    levelToneClass={levelBadgeClass(item.level)}
                    coachName={item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : null}
                    coachImageUrl={item.coach?.imageUrl ?? null}
                    topRightActions={
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          aria-label="Modifier la seance"
                          title="Modifier"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-brand-light/40 text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                            <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          aria-label="Supprimer la seance"
                          title="Supprimer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                            <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                          </svg>
                        </button>
                      </>
                    }
                    statsBadges={
                      <>
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 sm:text-xs">
                          Duree: {item.durationMinutes} min
                        </span>
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 sm:text-xs">
                          Places: {item.capacity}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-900 sm:text-xs">
                          Attente: {item.waitlistCapacity ?? "—"}
                        </span>
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-brand-dark">{editingId ? "Modifier seance" : "Ajouter une seance"}</h3>
          <p className="mt-2 text-sm text-brand-dark/70">Configurez le jour, l'heure, la duree et la capacite.</p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectMenu
                id="planning-day-form"
                label="Jour"
                value={dayOfWeek}
                onChange={(value) => setDayOfWeekLocal(value as "NONE" | PlanningDayOfWeek)}
                options={[
                  { value: "NONE", label: "Choisir un jour" },
                  { value: "MON", label: "Lundi" },
                  { value: "TUE", label: "Mardi" },
                  { value: "WED", label: "Mercredi" },
                  { value: "THU", label: "Jeudi" },
                  { value: "FRI", label: "Vendredi" },
                  { value: "SAT", label: "Samedi" },
                  { value: "SUN", label: "Dimanche" },
                ]}
              />
              <SelectMenu
                id="planning-course"
                label="Cours"
                value={courseSlug}
                onChange={(value) => setCourseSlug(value)}
                options={[
                  { value: "NONE", label: "Choisir un cours" },
                  ...courseOptions,
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectMenu
                id="planning-level"
                label="Niveau"
                value={level}
                onChange={(value) => setLevel(value as PlanningLevel)}
                options={[
                  { value: "ALL_LEVELS", label: "Tous niveaux" },
                  { value: "BEGINNER", label: "Debutant" },
                  { value: "INTERMEDIATE", label: "Intermediaire" },
                  { value: "ADVANCED", label: "Avance" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectMenu
                id="planning-coach"
                label="Coach"
                value={coachId}
                onChange={(value) => setCoachId(value)}
                options={[
                  { value: "NONE", label: "Aucun coach" },
                  ...coaches.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                id="planning-start-time"
                label="Heure de debut"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                id="planning-end-time"
                label="Heure de fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <Input
                id="planning-duration"
                label="Duree (minutes)"
                type="number"
                min={10}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="60"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="planning-capacity"
                label="Capacite"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="8"
              />
              <Input
                id="planning-waitlist"
                label="Liste d'attente (optionnel)"
                type="number"
                min={0}
                value={waitlistCapacity}
                onChange={(e) => setWaitlistCapacity(e.target.value)}
                placeholder="0"
              />
            </div>
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
              {isSubmitting ? "Enregistrement..." : editingId ? "Mettre a jour" : "Enregistrer"}
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Supprimer cette seance ?"
        description={itemToDelete ? `${dayLabels[itemToDelete.dayOfWeek]} - ${itemToDelete.startTime}` : undefined}
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setItemToDelete(null);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
});

