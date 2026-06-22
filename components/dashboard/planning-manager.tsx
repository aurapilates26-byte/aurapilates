"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, ConfirmDialog, Input, SelectMenu } from "@/components/ui";
import { PlanningSessionCard } from "@/components/dashboard/planning-session-card";
import { PlanningDaysScrollRow } from "@/components/dashboard/planning-days-scroll-row";
import { PlanningHistoricalPresenceDialog } from "@/components/planning/planning-historical-presence-dialog";
import { PlanningDayPill } from "@/components/planning/planning-day-pill";
import { PlanningPeriodActiveBadge } from "@/components/planning/planning-period-active-badge";
import { PlanningPeriodSettingsPanel } from "@/components/planning/planning-period-settings-panel";
import { badgeClasses } from "@/lib/badge-classes";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { buildPeriodDaySelectOptions, weekdayDateLineForPeriod, weekdaysPresentInPeriod } from "@/lib/planning-period-day-dates";
import { PLANNING_LEVEL_FORM_OPTIONS, planningLevelLabelFr } from "@/lib/planning-public-labels";
import { usePlanningStore } from "@/store";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { AdminCoach } from "@/types/admin/coach";
import type {
  AdminPlanningItem,
  PlanningAdminScope,
  PlanningArchivedPeriodItem,
  PlanningDayOfWeek,
  PlanningLevel,
  PlanningPeriodConfig,
  PlanningSessionFormSource,
  PlanningViewMode,
} from "@/types/admin/planning";

type LevelFormValue = "NONE" | PlanningLevel;

export type PlanningManagerHandle = {
  refresh: () => void;
};

type PlanningResponse = {
  items: AdminPlanningItem[];
};

type PlanningManagerProps = {
  viewMode: PlanningViewMode;
  onChangeViewMode: (mode: PlanningViewMode) => void;
  periodSettingsTab?: PlanningAdminScope;
  onPeriodSettingsTabChange?: (tab: PlanningAdminScope) => void;
  sessionFormSource?: PlanningSessionFormSource;
  onSessionFormSourceChange?: (source: PlanningSessionFormSource) => void;
};

const courseOptions = [
  { value: "pilates-reformer", label: "Pilates reformer" },
  { value: "mat-pilates", label: "Mat pilates" },
  { value: "yoga", label: "Yoga" },
  { value: "dance", label: "Danse" },
  { value: "coaching-prive", label: "Coaching privé" },
  { value: "sans-cours", label: "Sans cours" },
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

const orderedDays: PlanningDayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function sessionYmdForHistoricalSlot(
  item: AdminPlanningItem,
  selectedDay: PlanningDayOfWeek,
  periodConfig: PlanningPeriodConfig,
): string | null {
  if (item.anchorSessionYmd) return item.anchorSessionYmd;
  const options = buildPeriodDaySelectOptions(periodConfig.periodStartYmd, periodConfig.periodEndYmd);
  return options.find((o) => o.dayOfWeek === selectedDay)?.sessionYmd ?? null;
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

function planningItemApiUrl(
  itemId: string | null,
  sessionFormSource: PlanningSessionFormSource,
  archivePeriodStartYmd: string,
): string {
  const base = itemId
    ? `/api/admin/planning/items/${encodeURIComponent(itemId)}`
    : "/api/admin/planning";
  if (sessionFormSource === "archive" && archivePeriodStartYmd) {
    const params = new URLSearchParams({
      scope: "archive",
      periodStartYmd: archivePeriodStartYmd,
    });
    return `${base}?${params.toString()}`;
  }
  if (sessionFormSource === "draft") {
    return `${base}?scope=draft`;
  }
  return base;
}

function preselectSessionDay(
  period: PlanningPeriodConfig | null,
  selectedDay: PlanningDayOfWeek,
): { anchorSessionYmd: string; dayOfWeek: PlanningDayOfWeek } | null {
  if (!period) return null;
  const option = buildPeriodDaySelectOptions(period.periodStartYmd, period.periodEndYmd).find(
    (entry) => entry.dayOfWeek === selectedDay,
  );
  if (!option) return null;
  return { anchorSessionYmd: option.sessionYmd, dayOfWeek: option.dayOfWeek };
}

export const PlanningManager = forwardRef<PlanningManagerHandle, PlanningManagerProps>(function PlanningManagerWithRef(
  {
    viewMode,
    onChangeViewMode,
    periodSettingsTab = "published",
    onPeriodSettingsTabChange = () => {},
    sessionFormSource = "list",
    onSessionFormSourceChange = () => {},
  },
  ref
) {
  const showList = viewMode === "list";
  const showSessionForm = viewMode === "session-form";
  const { toast } = useToast();
  const fetchPeriodConfig = usePlanningPeriodStore((s) => s.fetchConfig);
  const periodConfig = usePlanningPeriodStore((s) => s.config);
  const draftPeriod = usePlanningPeriodStore((s) => s.draft);
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
  const [anchorSessionYmd, setAnchorSessionYmd] = useState("");
  const [level, setLevel] = useState<LevelFormValue>("NONE");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [capacity, setCapacity] = useState("");
  const [waitlistCapacity, setWaitlistCapacity] = useState("");

  const [archivedPeriods, setArchivedPeriods] = useState<PlanningArchivedPeriodItem[]>([]);
  const [selectedArchiveStartYmd, setSelectedArchiveStartYmd] = useState("");
  const [archivesLoading, setArchivesLoading] = useState(false);
  const [seedingArchives, setSeedingArchives] = useState(false);
  const [archiveItems, setArchiveItems] = useState<AdminPlanningItem[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<AdminPlanningItem[]>([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftSelectedDay, setDraftSelectedDay] = useState<PlanningDayOfWeek>(() => todayPlanningDay());
  const [historicalSlot, setHistoricalSlot] = useState<AdminPlanningItem | null>(null);
  const [historicalSessionYmd, setHistoricalSessionYmd] = useState<string | null>(null);

  const selectedArchivePeriod = useMemo(
    () => archivedPeriods.find((p) => p.periodStartYmd === selectedArchiveStartYmd) ?? null,
    [archivedPeriods, selectedArchiveStartYmd],
  );

  const draftPeriodConfig = useMemo((): PlanningPeriodConfig | null => {
    if (!draftPeriod) return null;
    return {
      bookingWindow: draftPeriod.bookingWindow,
      periodStartYmd: draftPeriod.periodStartYmd,
      periodEndYmd: draftPeriod.periodEndYmd,
      periodLabel: draftPeriod.periodLabel,
    };
  }, [draftPeriod]);

  const sessionPeriodConfig = useMemo((): PlanningPeriodConfig | null => {
    if (sessionFormSource === "archive") return selectedArchivePeriod;
    if (sessionFormSource === "draft") return draftPeriodConfig;
    return periodConfig;
  }, [sessionFormSource, selectedArchivePeriod, draftPeriodConfig, periodConfig]);

  const sessionDayFormOptions = useMemo(() => {
    if (!sessionPeriodConfig) return [];
    return buildPeriodDaySelectOptions(
      sessionPeriodConfig.periodStartYmd,
      sessionPeriodConfig.periodEndYmd,
    );
  }, [sessionPeriodConfig]);

  const useDatedDaySelect = sessionDayFormOptions.length > 0;

  const isDraftContext =
    sessionFormSource === "draft" ||
    (viewMode === "period-form" && periodSettingsTab === "draft");

  const isArchiveContext =
    sessionFormSource === "archive" ||
    (viewMode === "period-form" && periodSettingsTab === "archive");

  const isPeriodPlanningContext = isArchiveContext || isDraftContext;

  const loadArchives = useCallback(async () => {
    setArchivesLoading(true);
    try {
      const res = await fetch("/api/admin/planning/archive", { cache: "no-store" });
      const data = (await res.json()) as { items?: PlanningArchivedPeriodItem[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Impossible de charger l'historique.");
      const list = data.items ?? [];
      setArchivedPeriods(list);
      setSelectedArchiveStartYmd((prev) => {
        if (prev && list.some((p) => p.periodStartYmd === prev)) return prev;
        return list[0]?.periodStartYmd ?? "";
      });
    } catch (e) {
      toast({
        variant: "error",
        title: "Historique",
        description: e instanceof Error ? e.message : "Chargement impossible.",
      });
    } finally {
      setArchivesLoading(false);
    }
  }, [toast]);

  const seedArchives = useCallback(async () => {
    setSeedingArchives(true);
    try {
      const res = await fetch("/api/admin/planning/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = (await res.json()) as {
        items?: PlanningArchivedPeriodItem[];
        created?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Import impossible.");
      const list = data.items ?? [];
      setArchivedPeriods(list);
      setSelectedArchiveStartYmd(list[0]?.periodStartYmd ?? "");
      toast({
        variant: "success",
        title: "Périodes importées",
        description: `${data.created ?? 0} période(s) ajoutée(s) à l'historique.`,
      });
    } catch (e) {
      toast({
        variant: "error",
        title: "Import",
        description: e instanceof Error ? e.message : "Import impossible.",
      });
    } finally {
      setSeedingArchives(false);
    }
  }, [toast]);

  const loadArchivePlanning = useCallback(async (periodStartYmd: string) => {
    if (!periodStartYmd) {
      setArchiveItems([]);
      return;
    }
    setArchiveLoading(true);
    setArchiveError(null);
    try {
      const res = await fetch(
        `/api/admin/planning?scope=archive&periodStartYmd=${encodeURIComponent(periodStartYmd)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as PlanningResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Impossible de charger le planning archivé.");
      setArchiveItems(data.items);
    } catch (e) {
      setArchiveError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  const loadDraftPlanning = useCallback(async () => {
    setDraftLoading(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/admin/planning?scope=draft", { cache: "no-store" });
      const data = (await res.json()) as PlanningResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Impossible de charger le planning brouillon.");
      setDraftItems(data.items);
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setDraftLoading(false);
    }
  }, []);

  const openHistoricalPresence = (item: AdminPlanningItem) => {
    if (!selectedArchivePeriod) return;
    const ymd = sessionYmdForHistoricalSlot(item, selectedDay, selectedArchivePeriod);
    if (!ymd) {
      toast({
        variant: "error",
        title: "Date introuvable",
        description: "Impossible de déterminer la date du cours.",
      });
      return;
    }
    setHistoricalSlot(item);
    setHistoricalSessionYmd(ymd);
  };

  useEffect(() => {
    if (viewMode === "period-form" && periodSettingsTab === "archive") {
      void loadArchives();
    }
  }, [viewMode, periodSettingsTab, loadArchives]);

  useEffect(() => {
    if (viewMode === "period-form" && periodSettingsTab === "archive" && selectedArchiveStartYmd) {
      void loadArchivePlanning(selectedArchiveStartYmd);
    }
  }, [viewMode, periodSettingsTab, selectedArchiveStartYmd, loadArchivePlanning]);

  useEffect(() => {
    if (viewMode === "period-form" && periodSettingsTab === "draft" && draftPeriodConfig) {
      void loadDraftPlanning();
    }
  }, [viewMode, periodSettingsTab, draftPeriodConfig, loadDraftPlanning]);

  useEffect(() => {
    if (!draftPeriodConfig) return;
    const days = weekdaysPresentInPeriod(draftPeriodConfig.periodStartYmd, draftPeriodConfig.periodEndYmd);
    if (days.length > 0 && !days.includes(draftSelectedDay)) {
      setDraftSelectedDay(days[0]!);
    }
  }, [draftPeriodConfig, draftSelectedDay]);

  const visibleItems = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return items.filter((item) => {
      if (!q) return true;
      const coachName = item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : "";
      const haystack = `${item.courseSlug} ${coachName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filters.search, items]);

  const daysForTabs = useMemo(() => {
    if (!periodConfig) return orderedDays;
    return weekdaysPresentInPeriod(periodConfig.periodStartYmd, periodConfig.periodEndYmd);
  }, [periodConfig]);

  const sessionCountByDay = useMemo(
    () =>
      visibleItems.reduce<Record<PlanningDayOfWeek, number>>(
        (counts, item) => {
          counts[item.dayOfWeek] += 1;
          return counts;
        },
        { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 },
      ),
    [visibleItems],
  );

  useEffect(() => {
    if (daysForTabs.length > 0 && !daysForTabs.includes(selectedDay)) {
      setSelectedDay(daysForTabs[0]!);
    }
  }, [daysForTabs, selectedDay]);

  const visibleItemsByDay = useMemo(
    () =>
      visibleItems
        .filter((item) => item.dayOfWeek === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDay, visibleItems],
  );

  const loadPlanning = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/planning?scope=published", { cache: "no-store" });
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
    setAnchorSessionYmd("");
    setLevel("NONE");
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
    void fetchPeriodConfig({ source: "admin", force: true });
  }, []);

  useEffect(() => {
    if (viewMode === "list") {
      void loadPlanning();
    }
  }, [periodConfig?.periodStartYmd, periodConfig?.periodEndYmd, viewMode]);

  useEffect(() => {
    if (showSessionForm && !editingId) {
      resetForm();
      const dayForPreselect = isDraftContext ? draftSelectedDay : selectedDay;
      const preselect = preselectSessionDay(sessionPeriodConfig, dayForPreselect);
      if (preselect) {
        setAnchorSessionYmd(preselect.anchorSessionYmd);
        setDayOfWeekLocal(preselect.dayOfWeek);
      }
    }
  }, [editingId, selectedDay, draftSelectedDay, isDraftContext, sessionPeriodConfig, showSessionForm]);

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
    if (useDatedDaySelect && !anchorSessionYmd.trim()) {
      setFormError("Veuillez choisir la date du créneau.");
      return;
    }
    if (level === "NONE") {
      setFormError("Veuillez sélectionner un niveau.");
      return;
    }
    if (!startTime) {
      setFormError("Heure de début invalide.");
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
      setFormError("La durée doit être d'au moins 10 minutes.");
      return;
    }
    if (endTime <= startTime) {
      setFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (!Number.isFinite(cap) || cap < 1) {
      setFormError("Capacité invalide.");
      return;
    }
    if (waitCap !== null && (!Number.isFinite(waitCap) || waitCap < 0)) {
      setFormError("Liste d'attente invalide.");
      return;
    }

    const isEditMode = Boolean(editingId);
    setIsSubmitting(true);
    try {
      const response = await fetch(
        planningItemApiUrl(
          editingId,
          isArchiveContext ? "archive" : isDraftContext ? "draft" : "list",
          selectedArchiveStartYmd,
        ),
        {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: courseSlug.trim(),
          coachId: coachId === "NONE" ? undefined : coachId,
          dayOfWeek: dayOfWeek as PlanningDayOfWeek,
          anchorSessionYmd: anchorSessionYmd.trim() || undefined,
          level: level as PlanningLevel,
          startTime,
          endTime,
          durationMinutes: duration,
          capacity: cap,
          waitlistCapacity: waitCap === null ? undefined : waitCap,
        }),
      },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Enregistrement impossible.");
      }
      if (isArchiveContext && selectedArchiveStartYmd) {
        await loadArchivePlanning(selectedArchiveStartYmd);
      } else if (isDraftContext) {
        await loadDraftPlanning();
      } else {
        await loadPlanning();
      }
      resetForm();
      onChangeViewMode(isPeriodPlanningContext ? "period-form" : "list");
      toast({
        variant: "success",
        title: isEditMode ? "Séance modifiée" : "Séance ajoutée",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      setFormError(message);
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (
    item: AdminPlanningItem,
    options: { fromArchive?: boolean; fromDraft?: boolean } = {},
  ) => {
    const { fromArchive = false, fromDraft = false } = options;
    if (fromArchive) {
      onSessionFormSourceChange("archive");
    } else if (fromDraft) {
      onSessionFormSourceChange("draft");
    } else {
      onSessionFormSourceChange("list");
    }
    setEditingId(item.id);
    setCourseSlug(item.courseSlug);
    setCoachId(item.coach?.id ?? "NONE");
    setDayOfWeekLocal(item.dayOfWeek);
    setAnchorSessionYmd(
      item.anchorSessionYmd ??
        (fromArchive && selectedArchivePeriod
          ? preselectSessionDay(selectedArchivePeriod, item.dayOfWeek)?.anchorSessionYmd
          : null) ??
        (fromDraft && draftPeriodConfig
          ? preselectSessionDay(draftPeriodConfig, item.dayOfWeek)?.anchorSessionYmd
          : null) ??
        "",
    );
    setLevel(item.level ?? "NONE");
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setDurationMinutes(String(item.durationMinutes));
    setCapacity(String(item.capacity));
    setWaitlistCapacity(item.waitlistCapacity !== null ? String(item.waitlistCapacity) : "");
    setFormError(null);
    onChangeViewMode("session-form");
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        planningItemApiUrl(
          itemToDelete.id,
          isArchiveContext ? "archive" : isDraftContext ? "draft" : "list",
          selectedArchiveStartYmd,
        ),
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Suppression impossible.");
      }
      setItemToDelete(null);
      if (isArchiveContext && selectedArchiveStartYmd) {
        await loadArchivePlanning(selectedArchiveStartYmd);
      } else if (isDraftContext) {
        await loadDraftPlanning();
      } else {
        await loadPlanning();
      }
      toast({ variant: "success", title: "Séance supprimée" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh() {
      if (viewMode === "period-form" && periodSettingsTab === "archive" && selectedArchiveStartYmd) {
        void loadArchives();
        void loadArchivePlanning(selectedArchiveStartYmd);
      } else if (viewMode === "period-form" && periodSettingsTab === "draft") {
        void loadDraftPlanning();
      } else {
        void loadPlanning();
      }
      void loadCoaches();
      void fetchPeriodConfig({ source: "admin", force: true });
    },
  }));

  const backFromSessionForm = () => {
    onChangeViewMode(sessionFormSource === "list" ? "list" : "period-form");
  };

  return (
    <div className="space-y-6">
      {viewMode === "period-form" ? (
        <PlanningPeriodSettingsPanel
          settingsTab={periodSettingsTab}
          onSettingsTabChange={onPeriodSettingsTabChange}
          onSaved={() => {
            void fetchPeriodConfig({ source: "admin", force: true });
            void loadDraftPlanning();
          }}
          archiveProps={{
            archivedPeriods,
            selectedArchiveStartYmd,
            onSelectedArchiveStartYmdChange: setSelectedArchiveStartYmd,
            archivesLoading,
            seedingArchives,
            onSeedArchives: () => void seedArchives(),
            selectedArchivePeriod,
            selectedDay,
            onSelectedDayChange: (day) => {
              setSelectedDay(day);
              setDayOfWeek(day);
            },
            items: archiveItems,
            isLoading: archiveLoading,
            error: archiveError,
            onEditSession: (item) => handleStartEdit(item, { fromArchive: true }),
            onDeleteSession: setItemToDelete,
            onOpenPresence: openHistoricalPresence,
          }}
          draftProps={{
            draftPeriod: draftPeriodConfig,
            selectedDay: draftSelectedDay,
            onSelectedDayChange: (day) => {
              setDraftSelectedDay(day);
              setDayOfWeek(day);
            },
            items: draftItems,
            isLoading: draftLoading,
            error: draftError,
            onEditSession: (item) => handleStartEdit(item, { fromDraft: true }),
            onDeleteSession: setItemToDelete,
          }}
        />
      ) : showList ? (
        isLoading ? (
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">Chargement...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : (
          <div className="rounded-2xl border border-brand-medium/20 bg-white">
            <div className="border-b border-brand-medium/20 px-5 py-4">
              <PlanningPeriodActiveBadge source="admin" align="start" className="mb-4" />
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-base font-semibold text-brand-dark">Planning</p>
                  <p className="mt-1 text-xs text-brand-dark/60">
                    {visibleItemsByDay.length} résultat(s) — {dayLabels[selectedDay]}
                    {periodConfig ? ` · ${periodConfig.periodLabel}` : ""}
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
                    aria-label="Réinitialiser les filtres"
                    title="Réinitialiser"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark"
                  >
                    ×
                  </button>
                </div>
              </div>
              <PlanningDaysScrollRow
                className="-mx-5 mt-4"
                scrollClassName="lg:justify-center"
                scrollKey={`${periodConfig?.periodStartYmd ?? "none"}-${visibleItems.length}`}
              >
                <div className="flex w-max flex-nowrap items-center gap-2 px-5 pb-2 pr-1">
                  {daysForTabs.map((day) => (
                    <PlanningDayPill
                      key={day}
                      dayLabel={dayLabels[day]}
                      dateLabel={
                        periodConfig
                          ? weekdayDateLineForPeriod(
                              periodConfig.periodStartYmd,
                              periodConfig.periodEndYmd,
                              day,
                            )
                          : null
                      }
                      active={selectedDay === day}
                      count={sessionCountByDay[day]}
                      onClick={() => {
                        setSelectedDay(day);
                        setDayOfWeek(day);
                      }}
                    />
                  ))}
                </div>
              </PlanningDaysScrollRow>
            </div>

            {visibleItemsByDay.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-brand-dark/60">
                Aucune séance pour cette période.
                <span className="mt-2 block">
                  Utilisez « Ajouter une séance » pour créer les créneaux du {periodConfig?.periodLabel ?? "calendrier"}.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 sm:p-5 lg:grid-cols-3">
                {visibleItemsByDay.map((item) => (
                  <PlanningSessionCard
                    key={item.id}
                    variant="admin"
                    courseLabel={courseLabelBySlug[item.courseSlug] ?? item.courseSlug}
                    startTime={item.startTime}
                    levelLabel={planningLevelLabelFr(item.level)}
                    levelToneClass={planningLevelBadgeClass(item.level)}
                    coachName={item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : null}
                    coachImageUrl={item.coach?.imageUrl ?? null}
                    topRightActions={
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          aria-label="Modifier la séance"
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
                          aria-label="Supprimer la séance"
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
                        <span className={badgeClasses.availability}>Durée : {item.durationMinutes} min</span>
                        <span className={badgeClasses.availability}>Places: {item.capacity}</span>
                        <span className={badgeClasses.waitlist}>Attente: {item.waitlistCapacity ?? "—"}</span>
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
          <h3 className="text-xl font-semibold text-brand-dark">{editingId ? "Modifier la séance" : "Ajouter une séance"}</h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            {isArchiveContext
              ? "Choisissez la date exacte de la période passée, puis l'heure et la capacité."
              : isDraftContext
                ? "Choisissez la date exacte de la prochaine période (brouillon), puis l'heure et la capacité."
                : "Configurez le jour, l'heure, la durée et la capacité."}
          </p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectMenu
                id="planning-day-form"
                label={useDatedDaySelect ? "Jour (date)" : "Jour"}
                value={useDatedDaySelect ? anchorSessionYmd || "NONE" : dayOfWeek}
                onChange={(value) => {
                  if (useDatedDaySelect) {
                    if (value === "NONE") {
                      setAnchorSessionYmd("");
                      setDayOfWeekLocal("NONE");
                      return;
                    }
                    const option = sessionDayFormOptions.find((entry) => entry.sessionYmd === value);
                    setAnchorSessionYmd(value);
                    setDayOfWeekLocal(option?.dayOfWeek ?? "NONE");
                    return;
                  }
                  setDayOfWeekLocal(value as "NONE" | PlanningDayOfWeek);
                }}
                options={
                  useDatedDaySelect
                    ? [
                        { value: "NONE", label: "Choisir un jour" },
                        ...sessionDayFormOptions.map((entry) => ({
                          value: entry.sessionYmd,
                          label: entry.label,
                        })),
                      ]
                    : [
                        { value: "NONE", label: "Choisir un jour" },
                        { value: "MON", label: "Lundi" },
                        { value: "TUE", label: "Mardi" },
                        { value: "WED", label: "Mercredi" },
                        { value: "THU", label: "Jeudi" },
                        { value: "FRI", label: "Vendredi" },
                        { value: "SAT", label: "Samedi" },
                        { value: "SUN", label: "Dimanche" },
                      ]
                }
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
                id="planning-coach"
                label="Coach"
                value={coachId}
                onChange={(value) => setCoachId(value)}
                options={[
                  { value: "NONE", label: "Aucun coach" },
                  ...coaches.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })),
                ]}
              />
              <SelectMenu<LevelFormValue>
                id="planning-level"
                label="Niveau"
                value={level}
                onChange={(value) => setLevel(value)}
                options={[
                  { value: "NONE", label: "Sélectionner un niveau" },
                  ...PLANNING_LEVEL_FORM_OPTIONS,
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                id="planning-start-time"
                label="Heure de début"
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
                label="Durée (minutes)"
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
                label="Capacité"
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
                backFromSessionForm();
              }}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
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
        isOpen={Boolean(itemToDelete)}
        title="Supprimer cette séance ?"
        description={itemToDelete ? `${dayLabels[itemToDelete.dayOfWeek]} - ${itemToDelete.startTime}` : undefined}
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) setItemToDelete(null);
        }}
        onConfirm={() => void handleDelete()}
      />

      <PlanningHistoricalPresenceDialog
        open={Boolean(historicalSlot)}
        onClose={() => {
          setHistoricalSlot(null);
          setHistoricalSessionYmd(null);
        }}
        slot={historicalSlot}
        sessionDateYmd={historicalSessionYmd}
        periodConfig={selectedArchivePeriod}
        courseLabel={historicalSlot ? courseLabelBySlug[historicalSlot.courseSlug] ?? historicalSlot.courseSlug : ""}
      />
    </div>
  );
});

