import { describe, expect, it } from "vitest";
import { classifyPrimaryPackKind } from "@/lib/member-primary-pack-state";

describe("classifyPrimaryPackKind vs prolongation", () => {
  it("reste Prolongé si prolongedAt est posé même avec une date de fin périmée", () => {
    expect(
      classifyPrimaryPackKind({
        hasPack: true,
        packStartedAt: new Date("2026-06-25T00:00:00.000Z"),
        packExpiresAt: new Date("2026-08-18T00:00:00.000Z"),
        prolongedAt: new Date("2026-10-01T17:26:14.426Z"),
        consumedSessions: 10,
        totalSessions: 12,
        remainingSessions: 2,
      }),
    ).toBe("prolonged");
  });

  it("est Terminé à 12/12 même si le pack avait été prolongé", () => {
    expect(
      classifyPrimaryPackKind({
        hasPack: true,
        packStartedAt: new Date("2026-06-25T00:00:00.000Z"),
        packExpiresAt: new Date("2026-08-18T00:00:00.000Z"),
        prolongedAt: new Date("2026-10-01T17:26:14.426Z"),
        consumedSessions: 12,
        totalSessions: 12,
        remainingSessions: 0,
      }),
    ).toBe("finished");
  });
});
