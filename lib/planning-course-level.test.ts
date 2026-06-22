import { describe, expect, it } from "vitest";
import {
  PLANNING_NO_COURSE_SLUG,
  REFORMER_PLANNING_COURSE_SLUG,
  normalizePlanningLevelForDb,
  resolvePlanningLevelForCourse,
} from "@/lib/planning-course-level";

describe("resolvePlanningLevelForCourse", () => {
  it("keeps initiation (ALL_LEVELS) for Pilates reformer", () => {
    const result = resolvePlanningLevelForCourse(REFORMER_PLANNING_COURSE_SLUG, "ALL_LEVELS");
    expect(result).toEqual({ ok: true, level: "ALL_LEVELS" });
  });

  it("maps sans niveau to null", () => {
    const result = resolvePlanningLevelForCourse(REFORMER_PLANNING_COURSE_SLUG, "NONE");
    expect(result).toEqual({ ok: true, level: null });
  });

  it("drops ALL_LEVELS for non-reformer courses", () => {
    const result = resolvePlanningLevelForCourse("mat-pilates", "ALL_LEVELS");
    expect(result).toEqual({ ok: true, level: null });
  });

  it("drops level for sans-cours", () => {
    expect(normalizePlanningLevelForDb(PLANNING_NO_COURSE_SLUG, "BEGINNER")).toBeNull();
  });

  it("keeps débutant + (INTERMEDIATE) for Pilates reformer", () => {
    const result = resolvePlanningLevelForCourse(REFORMER_PLANNING_COURSE_SLUG, "INTERMEDIATE");
    expect(result).toEqual({ ok: true, level: "INTERMEDIATE" });
  });

  it("keeps intermédiaire (ADVANCED) for Pilates reformer", () => {
    const result = resolvePlanningLevelForCourse(REFORMER_PLANNING_COURSE_SLUG, "ADVANCED");
    expect(result).toEqual({ ok: true, level: "ADVANCED" });
  });
});
