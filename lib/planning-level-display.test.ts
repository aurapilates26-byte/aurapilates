import { describe, expect, it } from "vitest";
import { planningLevelDisplay } from "@/lib/planning-level-display";

describe("planningLevelDisplay", () => {
  it("returns label and tone for ALL_LEVELS", () => {
    expect(planningLevelDisplay("ALL_LEVELS")).toEqual({
      label: "initiations",
      toneClass: expect.stringContaining("border-violet"),
    });
  });

  it("returns label and tone for BEGINNER", () => {
    expect(planningLevelDisplay("BEGINNER")).toEqual({
      label: "débutant",
      toneClass: expect.stringContaining("border-emerald"),
    });
  });

  it("returns label and tone for INTERMEDIATE", () => {
    expect(planningLevelDisplay("INTERMEDIATE")).toEqual({
      label: "débutant +",
      toneClass: expect.stringContaining("border-rose"),
    });
  });

  it("returns label and tone for ADVANCED", () => {
    expect(planningLevelDisplay("ADVANCED")).toEqual({
      label: "intermédiaire",
      toneClass: expect.stringContaining("border-sky"),
    });
  });

  it("returns null when level is missing", () => {
    expect(planningLevelDisplay(null)).toBeNull();
    expect(planningLevelDisplay(undefined)).toBeNull();
  });
});
