"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { Button, ConfirmDialog, Input, SelectMenu } from "@/components/ui";
import { PlanningPeriodNavigator } from "@/components/planning/planning-period-navigator";
import { PlanningWeekGrid } from "@/components/planning/planning-week-grid";
import { PlanningHistoricalPresenceDialog } from "@/components/planning/planning-historical-presence-dialog";
import { PlanningYesterdayPresenceStrip } from "@/components/planning/planning-yesterday-presence-strip";
import { PlanningPeriodSettingsPanel } from "@/components/planning/planning-period-settings-panel";
import {
  computePlanningCourseEnd,
  computePlanningGlobalSlotEnd,
  DEFAULT_PLANNING_CAPACITY,
  DEFAULT_PLANNING_COURSE_MINUTES,
  DEFAULT_PLANNING_WAITLIST_CAPACITY,
  hasPlanningSlotOverlap,
  PLANNING_GLOBAL_SLOT_MINUTES,
  PLANNING_SLOT_OVERLAP_ERROR,
  sessionCapacityForCourseSlug,
} from "@/lib/planning-session-slot";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { buildPeriodDaySelectOptions, weekdayDateLineForPeriod, weekdaysPresentInPeriod } from "@/lib/planning-period-day-dates";
import {
  periodContainsYmd,
  resolveCalendarCurrentPeriod,
  resolveNextPlanningPeriod,
  resolvePeriodConfigForSessionYmd,
  todayYmdLocal,
  yesterdayYmdLocal,
} from "@/lib/admin/planning-admin-calendar-period";
import { PLANNING_LEVEL_FORM_OPTIONS, planningLevelLabelFr } from "@/lib/planning-public-labels";
import { planningGridCacheKey, planningGridFetchUrl } from "@/lib/planning-grid-cache-key";
import { PlanningGridLoadingState } from "@/components/ui/spinner";
import { usePlanningStore } from "@/store";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import { useDashboardRole } from "@/components/dashboard/dashboard-role-context";
import { isStaffRole } from "@/lib/admin/access";
import type { AdminCoach } from "@/types/admin/coach";
import type {
  AdminPlanningItem,
  PlanningArchivedPeriodItem,
  PlanningDayOfWeek,
  PlanningGridNavSlot,
  PlanningLevel,
  PlanningPeriodConfig,
  PlanningSessionFormSource,
  PlanningViewMode,
} from "@/types/admin/planning";

type LevelFormValue = "NONE" | PlanningLevel;

export type PlanningManagerHandle = {
  refresh: () => void;
};

type PlanningManagerProps = {
  viewMode: PlanningViewMode;
  onChangeViewMode: (mode: PlanningViewMode) => void;
  sessionFormSource?: PlanningSessionFormSource;
  onSessionFormSourceChange?: (source: PlanningSessionFormSource) => void;
  sessionFormReturnView?: "list" | "period-form";
  onSessionFormReturnViewChange?: (view: "list" | "period-form") => void;
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
    ? `/api/admin/planning-items/${encodeURIComponent(itemId)}`
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
    sessionFormSource = "list",
    onSessionFormSourceChange = () => {},
    sessionFormReturnView = "list",
    onSessionFormReturnViewChange = () => {},
  },
  ref
) {
  const showList = viewMode === "list";
  const showSessionForm = viewMode === "session-form";
  const { toast } = useToast();
  const dashboardRole = useDashboardRole();
  const canManagePresence = isStaffRole(dashboardRole);
  const fetchPeriodConfig = usePlanningPeriodStore((s) => s.fetchConfig);
  const periodConfig = usePlanningPeriodStore((s) => s.config);
  const draftPeriod = usePlanningPeriodStore((s) => s.draft);
  const { items, filters, setSearch, setDayOfWeek, resetFilters, fetchGridForSlot, hasGridCache, gridCache, gridLoadingKey, gridError, gridErrorKey } =
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
  const [durationMinutes, setDurationMinutes] = useState(String(DEFAULT_PLANNING_COURSE_MINUTES));
  const [capacity, setCapacity] = useState(String(DEFAULT_PLANNING_CAPACITY));
  const [waitlistCapacity, setWaitlistCapacity] = useState(String(DEFAULT_PLANNING_WAITLIST_CAPACITY));

  const [archivedPeriods, setArchivedPeriods] = useState<PlanningArchivedPeriodItem[]>([]);
  const [selectedArchiveStartYmd, setSelectedArchiveStartYmd] = useState("");
  const [draftSelectedDay, setDraftSelectedDay] = useState<PlanningDayOfWeek>(() => todayPlanningDay());
  const [historicalSlot, setHistoricalSlot] = useState<AdminPlanningItem | null>(null);
  const [historicalSessionYmd, setHistoricalSessionYmd] = useState<string | null>(null);
  const [historicalPeriodConfig, setHistoricalPeriodConfig] = useState<PlanningPeriodConfig | null>(null);
  const [yesterdayItems, setYesterdayItems] = useState<AdminPlanningItem[]>([]);
  const [yesterdayLoading, setYesterdayLoading] = useState(false);

  const [gridNavIndex, setGridNavIndex] = useState<number | null>(null);
  const [gridNavPinned, setGridNavPinned] = useState(false);

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

  const gridNavSlots = useMemo((): PlanningGridNavSlot[] => {
    const todayYmd = todayYmdLocal();
    const ascending = [...archivedPeriods].sort((a, b) =>
      a.periodStartYmd.localeCompare(b.periodStartYmd),
    );

    const calendarCurrent = resolveCalendarCurrentPeriod(todayYmd, periodConfig, ascending);
    const nextPeriod = resolveNextPlanningPeriod(calendarCurrent);

    const slots: PlanningGridNavSlot[] = [];

    const currentStartYmd = calendarCurrent?.period.periodStartYmd ?? todayYmd;

    for (const arch of ascending) {
      if (calendarCurrent?.source === "archive" && arch.periodStartYmd === calendarCurrent.archiveStartYmd) {
        continue;
      }
      if (arch.periodEndYmd < currentStartYmd) {
        slots.push({
          kind: "archive",
          periodStartYmd: arch.periodStartYmd,
          period: {
            bookingWindow: arch.bookingWindow,
            periodStartYmd: arch.periodStartYmd,
            periodEndYmd: arch.periodEndYmd,
            periodLabel: arch.periodLabel,
          },
        });
      }
    }

    if (calendarCurrent) {
      slots.push({
        kind: "published",
        period: calendarCurrent.period,
        sessionScope: calendarCurrent.source === "archive" ? "archive" : "published",
        archiveStartYmd: calendarCurrent.archiveStartYmd,
      });
    }

    if (nextPeriod) {
      slots.push({
        kind: "draft",
        period: nextPeriod,
        sessionScope: "draft",
      });
    }

    return slots;
  }, [archivedPeriods, periodConfig, draftPeriodConfig]);

  const defaultGridNavIndex = useMemo(() => {
    const publishedIdx = gridNavSlots.findIndex((slot) => slot.kind === "published");
    return publishedIdx >= 0 ? publishedIdx : 0;
  }, [gridNavSlots]);

  const effectiveGridNavIndex = gridNavPinned && gridNavIndex !== null ? gridNavIndex : defaultGridNavIndex;

  const currentGridSlot = gridNavSlots[effectiveGridNavIndex] ?? null;

  const currentGridCacheKey = useMemo(
    () => (currentGridSlot ? planningGridCacheKey(currentGridSlot) : null),
    [currentGridSlot],
  );

  const gridItems = currentGridCacheKey ? gridCache[currentGridCacheKey] ?? [] : [];

  const showGridSpinner = Boolean(
    currentGridCacheKey && !hasGridCache(currentGridCacheKey) && gridLoadingKey === currentGridCacheKey,
  );

  const currentGridError =
    currentGridCacheKey && gridErrorKey === currentGridCacheKey ? gridError : null;

  const draftGridCacheKey = useMemo(() => {
    if (!draftPeriodConfig) return null;
    return planningGridCacheKey({
      kind: "draft",
      period: draftPeriodConfig,
      sessionScope: "draft",
    });
  }, [draftPeriodConfig]);

  const archiveGridCacheKey = selectedArchiveStartYmd ? `archive:${selectedArchiveStartYmd}` : null;

  const draftItems = draftGridCacheKey ? gridCache[draftGridCacheKey] ?? [] : [];
  const archiveItems = archiveGridCacheKey ? gridCache[archiveGridCacheKey] ?? [] : [];

  const loadGridSlot = useCallback(
    async (slot: PlanningGridNavSlot, options?: { force?: boolean }) => {
      const key = planningGridCacheKey(slot);
      const url = planningGridFetchUrl(slot);
      const hadCache = hasGridCache(key);
      try {
        await fetchGridForSlot(key, url, options);
        if (!hadCache && !options?.force && slot.kind === "draft") {
          await fetchPeriodConfig({ source: "admin", force: true });
        }
      } catch {
        // Erreur déjà enregistrée dans le store.
      }
    },
    [fetchGridForSlot, hasGridCache, fetchPeriodConfig],
  );

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

  const computedGlobalSlotEnd = useMemo(() => {
    if (!startTime) return null;
    return computePlanningGlobalSlotEnd(startTime);
  }, [startTime]);

  const computedCourseEnd = useMemo(() => {
    const duration = Number(durationMinutes);
    if (!startTime || !Number.isFinite(duration) || duration < 10) return null;
    return computePlanningCourseEnd(startTime, duration);
  }, [durationMinutes, startTime]);

  const isDraftContext = sessionFormSource === "draft";
  const isArchiveContext = sessionFormSource === "archive";

  const loadArchives = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/planning-archives", { cache: "no-store" });
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
    }
  }, [toast]);

  const loadArchivePlanning = useCallback(
    async (periodStartYmd: string, options?: { force?: boolean }) => {
      if (!periodStartYmd) return;
      const period = archivedPeriods.find((p) => p.periodStartYmd === periodStartYmd);
      if (!period) {
        const key = `archive:${periodStartYmd}`;
        const url = `/api/admin/planning?scope=archive&periodStartYmd=${encodeURIComponent(periodStartYmd)}`;
        await fetchGridForSlot(key, url, options);
        return;
      }
      const slot: PlanningGridNavSlot = {
        kind: "archive",
        periodStartYmd,
        period,
      };
      await loadGridSlot(slot, options);
    },
    [archivedPeriods, loadGridSlot, fetchGridForSlot],
  );

  const loadDraftPlanning = useCallback(
    async (options?: { force?: boolean }) => {
      if (!draftPeriodConfig) return;
      const slot: PlanningGridNavSlot = {
        kind: "draft",
        period: draftPeriodConfig,
        sessionScope: "draft",
      };
      await loadGridSlot(slot, options);
    },
    [draftPeriodConfig, loadGridSlot],
  );

  useEffect(() => {
    if (showList) void loadArchives();
  }, [showList, loadArchives]);

  const periodAnchorKey = `${periodConfig?.periodStartYmd ?? ""}|${periodConfig?.periodEndYmd ?? ""}|${draftPeriod?.periodStartYmd ?? ""}`;

  useEffect(() => {
    setGridNavPinned(false);
    setGridNavIndex(null);
  }, [periodAnchorKey]);

  useEffect(() => {
    if (!showList || !currentGridSlot) return;
    void loadGridSlot(currentGridSlot);
    if (currentGridSlot.kind === "archive") {
      setSelectedArchiveStartYmd(currentGridSlot.periodStartYmd);
      onSessionFormSourceChange("archive");
    } else if (currentGridSlot.kind === "draft") {
      onSessionFormSourceChange("draft");
    } else if (currentGridSlot.sessionScope === "archive" && currentGridSlot.archiveStartYmd) {
      setSelectedArchiveStartYmd(currentGridSlot.archiveStartYmd);
      onSessionFormSourceChange("archive");
    } else {
      onSessionFormSourceChange("list");
    }
  }, [showList, currentGridSlot, loadGridSlot, onSessionFormSourceChange]);

  useEffect(() => {
    if (!draftPeriodConfig) return;
    const days = weekdaysPresentInPeriod(draftPeriodConfig.periodStartYmd, draftPeriodConfig.periodEndYmd);
    if (days.length > 0 && !days.includes(draftSelectedDay)) {
      setDraftSelectedDay(days[0]!);
    }
  }, [draftPeriodConfig, draftSelectedDay]);

  const visibleGridItems = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return gridItems.filter((item) => {
      if (!q) return true;
      const coachName = item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : "";
      const haystack = `${item.courseSlug} ${coachName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filters.search, gridItems]);

  const yesterdayYmd = yesterdayYmdLocal();

  const yesterdayPeriod = useMemo(
    () =>
      resolvePeriodConfigForSessionYmd(yesterdayYmd, {
        published: periodConfig,
        archives: archivedPeriods,
      }),
    [archivedPeriods, periodConfig, yesterdayYmd],
  );

  const showYesterdayPresencePanel = Boolean(
    canManagePresence &&
      showList &&
      currentGridSlot?.kind === "published" &&
      currentGridSlot.sessionScope !== "archive" &&
      yesterdayPeriod &&
      !periodContainsYmd(currentGridSlot.period, yesterdayYmd),
  );

  const visibleYesterdayItems = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return yesterdayItems.filter((item) => {
      if (!q) return true;
      const coachName = item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : "";
      const haystack = `${item.courseSlug} ${coachName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filters.search, yesterdayItems]);

  useEffect(() => {
    if (!showYesterdayPresencePanel || !yesterdayPeriod) {
      setYesterdayItems([]);
      return;
    }

    let cancelled = false;
    setYesterdayLoading(true);

    void (async () => {
      try {
        const res = await fetch(
          `/api/admin/planning?scope=archive&periodStartYmd=${encodeURIComponent(yesterdayPeriod.periodStartYmd)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as { items?: AdminPlanningItem[] };
        if (cancelled) return;
        setYesterdayItems((data.items ?? []).filter((item) => item.anchorSessionYmd === yesterdayYmd));
      } catch {
        if (!cancelled) setYesterdayItems([]);
      } finally {
        if (!cancelled) setYesterdayLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showYesterdayPresencePanel, yesterdayPeriod, yesterdayYmd]);

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
    setDurationMinutes(String(DEFAULT_PLANNING_COURSE_MINUTES));
    setCapacity(String(DEFAULT_PLANNING_CAPACITY));
    setWaitlistCapacity(String(DEFAULT_PLANNING_WAITLIST_CAPACITY));
    setFormError(null);
  };

  useEffect(() => {
    void loadCoaches();
    void fetchPeriodConfig({ source: "admin" });
  }, []);

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
    const duration = Number(durationMinutes);
    const cap = Number(capacity);
    const waitCap = waitlistCapacity.trim() ? Number(waitlistCapacity) : null;
    const endTime = computePlanningGlobalSlotEnd(startTime);

    if (!Number.isFinite(duration) || duration < 10) {
      setFormError("La durée doit être d'au moins 10 minutes.");
      return;
    }
    if (duration > PLANNING_GLOBAL_SLOT_MINUTES) {
      setFormError(
        `La durée du cours ne peut pas dépasser ${PLANNING_GLOBAL_SLOT_MINUTES} minutes (créneau global d'1 heure).`,
      );
      return;
    }
    if (!endTime) {
      setFormError("Impossible de calculer la fin du créneau (vérifiez l'heure de début).");
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

    const resolvedAnchorYmd = anchorSessionYmd.trim();
    const sessionItemsForDuplicateCheck = isArchiveContext
      ? archiveItems
      : isDraftContext
        ? draftItems
        : items;
    if (
      resolvedAnchorYmd &&
      hasPlanningSlotOverlap(
        sessionItemsForDuplicateCheck,
        resolvedAnchorYmd,
        courseSlug.trim(),
        startTime,
        editingId,
      )
    ) {
      setFormError(PLANNING_SLOT_OVERLAP_ERROR);
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
        await loadArchivePlanning(selectedArchiveStartYmd, { force: true });
      } else if (isDraftContext) {
        await loadDraftPlanning({ force: true });
      } else if (currentGridSlot) {
        await loadGridSlot(currentGridSlot, { force: true });
      }
      resetForm();
      onChangeViewMode(sessionFormReturnView);
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
    setDurationMinutes(String(item.durationMinutes));
    setCapacity(String(item.capacity));
    setWaitlistCapacity(item.waitlistCapacity !== null ? String(item.waitlistCapacity) : "");
    setFormError(null);
    onSessionFormReturnViewChange(viewMode === "period-form" ? "period-form" : "list");
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
        await loadArchivePlanning(selectedArchiveStartYmd, { force: true });
      } else if (isDraftContext) {
        await loadDraftPlanning({ force: true });
      } else if (currentGridSlot) {
        await loadGridSlot(currentGridSlot, { force: true });
      }
      toast({ variant: "success", title: "Séance supprimée" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const resolveHistoricalPeriod = useCallback(
    (sessionYmd: string): PlanningPeriodConfig | null =>
      resolvePeriodConfigForSessionYmd(sessionYmd, {
        published: periodConfig,
        archives: archivedPeriods,
        fallback: currentGridSlot?.period ?? null,
      }),
    [archivedPeriods, currentGridSlot, periodConfig],
  );

  const openGridHistoricalPresence = (item: AdminPlanningItem, sessionYmdOverride?: string) => {
    const ymd = sessionYmdOverride ?? item.anchorSessionYmd;
    if (!ymd) {
      toast({
        variant: "error",
        title: "Date introuvable",
        description: "Impossible de déterminer la date du cours.",
      });
      return;
    }

    const resolvedPeriod = resolveHistoricalPeriod(ymd);
    if (!resolvedPeriod) {
      toast({
        variant: "error",
        title: "Période introuvable",
        description: "Impossible de déterminer la période pour cette date de cours.",
      });
      return;
    }

    setHistoricalPeriodConfig(resolvedPeriod);
    setHistoricalSlot(item);
    setHistoricalSessionYmd(ymd);
  };

  const showHistoricalPresenceAction = (item: AdminPlanningItem) => {
    if (!canManagePresence) return false;
    const sessionYmd = item.anchorSessionYmd;
    if (!sessionYmd) return false;
    if (currentGridSlot?.kind === "archive") return true;
    if (currentGridSlot?.kind !== "published") return false;
    return sessionYmd < todayYmdLocal();
  };

  const gridActionBtnClass =
    "inline-flex h-6 w-6 items-center justify-center rounded-md border transition hover:opacity-90";

  const renderGridSessionActions = (item: AdminPlanningItem) => (
    <>
      {showHistoricalPresenceAction(item) ? (
        <button
          type="button"
          onClick={() => openGridHistoricalPresence(item)}
          aria-label="Présences"
          title="Présences"
          className={`${gridActionBtnClass} border-brand-medium/30 bg-white text-brand-dark`}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
          </svg>
        </button>
      ) : null}
      <button
        type="button"
        onClick={() =>
          handleStartEdit(item, {
            fromArchive:
              currentGridSlot?.kind === "archive" ||
              (currentGridSlot?.kind === "published" &&
                currentGridSlot.sessionScope === "archive"),
            fromDraft: currentGridSlot?.kind === "draft",
          })
        }
        aria-label="Modifier la séance"
        title="Modifier"
        className={`${gridActionBtnClass} border-brand-medium/30 bg-white/80 text-brand-dark`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setItemToDelete(item)}
        aria-label="Supprimer la séance"
        title="Supprimer"
        className={`${gridActionBtnClass} border-red-200 bg-red-50 text-red-700`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
        </svg>
      </button>
    </>
  );

  useImperativeHandle(ref, () => ({
    refresh() {
      if (viewMode === "period-form") {
        void fetchPeriodConfig({ source: "admin", force: true });
      } else if (currentGridSlot) {
        void loadGridSlot(currentGridSlot, { force: true });
      }
      void loadCoaches();
      void fetchPeriodConfig({ source: "admin", force: true });
    },
  }));

  const backFromSessionForm = () => {
    onChangeViewMode(sessionFormReturnView);
  };

  return (
    <div className="space-y-6">
      {viewMode === "period-form" ? (
        <PlanningPeriodSettingsPanel />
      ) : showList ? (
        showGridSpinner ? (
          <PlanningGridLoadingState />
        ) : currentGridError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{currentGridError}</div>
        ) : currentGridSlot ? (
          <div className="flex max-h-[calc(100dvh-10rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-brand-medium/20 bg-white">
            <div className="shrink-0 border-b border-brand-medium/20 px-4 py-3 sm:px-5 sm:py-4">
              <PlanningPeriodNavigator
                slot={currentGridSlot}
                canGoPrevious={effectiveGridNavIndex > 0}
                canGoNext={effectiveGridNavIndex < gridNavSlots.length - 1}
                onPrevious={() => {
                  setGridNavPinned(true);
                  setGridNavIndex(Math.max(0, effectiveGridNavIndex - 1));
                }}
                onNext={() => {
                  setGridNavPinned(true);
                  setGridNavIndex(Math.min(gridNavSlots.length - 1, effectiveGridNavIndex + 1));
                }}
                center={
                  <div className="grid w-full min-w-0 max-w-md grid-cols-[1fr_36px] items-center gap-1.5 sm:grid-cols-[1fr_42px] sm:gap-2">
                    <Input
                      id="planning-search"
                      value={filters.search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cours, coach..."
                      className="mt-0 py-2 text-sm sm:py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => resetFilters()}
                      aria-label="Réinitialiser les filtres"
                      title="Réinitialiser"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-lg font-semibold text-brand-dark/70 transition hover:bg-zinc-50 hover:text-brand-dark sm:h-[42px] sm:w-[42px]"
                    >
                      ×
                    </button>
                  </div>
                }
              />
            </div>

            {showYesterdayPresencePanel ? (
              <PlanningYesterdayPresenceStrip
                yesterdayYmd={yesterdayYmd}
                items={visibleYesterdayItems}
                loading={yesterdayLoading}
                courseLabelBySlug={courseLabelBySlug}
                onOpenPresence={(item) => openGridHistoricalPresence(item, yesterdayYmd)}
              />
            ) : null}

            {visibleGridItems.length === 0 ? (
              <div className="shrink-0 px-5 py-10 text-center text-sm text-brand-dark/60">
                Aucune séance pour cette période.
                <span className="mt-2 block">
                  Utilisez « Ajouter une séance » pour créer les créneaux.
                </span>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <PlanningWeekGrid
                period={currentGridSlot.period}
                items={visibleGridItems}
                courseLabelBySlug={courseLabelBySlug}
                renderSessionActions={renderGridSessionActions}
                levelLabelFor={(level) => planningLevelLabelFr(level)}
                levelToneFor={(level) => planningLevelBadgeClass(level)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70">
            Chargement de la période...
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
                onChange={(value) => {
                  setCourseSlug(value);
                  if (value !== "NONE") {
                    setCapacity(String(sessionCapacityForCourseSlug(value)));
                  }
                }}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="planning-start-time"
                label="Heure de début"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                id="planning-duration"
                label="Durée (minutes)"
                type="number"
                min={10}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            {computedGlobalSlotEnd ? (
              <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3 text-sm text-brand-dark/70">
                <p>
                  Créneau réservé (1 h) :{" "}
                  <span className="font-semibold text-brand-dark">
                    {startTime} – {computedGlobalSlotEnd}
                  </span>
                </p>
                {computedCourseEnd ? (
                  <p className="mt-1">
                    Cours effectif ({durationMinutes} min) :{" "}
                    <span className="font-semibold text-brand-dark">
                      {startTime} – {computedCourseEnd}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="planning-capacity"
                label="Capacité"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <Input
                id="planning-waitlist"
                label="Liste d'attente (optionnel)"
                type="number"
                min={0}
                value={waitlistCapacity}
                onChange={(e) => setWaitlistCapacity(e.target.value)}
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
          setHistoricalPeriodConfig(null);
        }}
        slot={historicalSlot}
        sessionDateYmd={historicalSessionYmd}
        periodConfig={historicalPeriodConfig}
        courseLabel={historicalSlot ? courseLabelBySlug[historicalSlot.courseSlug] ?? historicalSlot.courseSlug : ""}
      />
    </div>
  );
});

