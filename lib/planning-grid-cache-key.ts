import type { PlanningGridNavSlot } from "@/types/admin/planning";

/** Clé stable pour mettre en cache les séances d'une vue grille. */
export function planningGridCacheKey(slot: PlanningGridNavSlot): string {
  if (slot.kind === "archive") {
    return `archive:${slot.periodStartYmd}`;
  }
  if (slot.kind === "draft") {
    return `draft:${slot.period.periodStartYmd}`;
  }
  const scope = slot.sessionScope ?? "published";
  if (scope === "archive" && slot.archiveStartYmd) {
    return `current-archive:${slot.archiveStartYmd}`;
  }
  return `published:${slot.period.periodStartYmd}`;
}

export function planningGridFetchUrl(slot: PlanningGridNavSlot): string {
  let scope: "published" | "draft" | "archive" = "published";
  let archiveStart = "";

  if (slot.kind === "archive") {
    scope = "archive";
    archiveStart = slot.periodStartYmd;
  } else if (slot.kind === "draft") {
    scope = slot.sessionScope ?? "draft";
  } else {
    scope = slot.sessionScope ?? "published";
    archiveStart = slot.archiveStartYmd ?? "";
  }

  let url = `/api/admin/planning?scope=${scope}`;
  if (scope === "archive" && archiveStart) {
    url += `&periodStartYmd=${encodeURIComponent(archiveStart)}`;
  }
  return url;
}
