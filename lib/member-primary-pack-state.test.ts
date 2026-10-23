import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assignConsumedReservationsToEnrollments } from "./member-pack-consumption-assign";
import {
  classifyPrimaryPackKind,
  isPrimaryPackOperationallyActive,
} from "./member-primary-pack-state";

describe("isPrimaryPackOperationallyActive", () => {
  it("reste inactive après l'achat et une réservation sans présence", () => {
    assert.equal(isPrimaryPackOperationallyActive({ hasPack: true, attendedSessions: 0 }), false);
  });

  it("devient active dès qu'une présence du pack principal est marquée", () => {
    assert.equal(isPrimaryPackOperationallyActive({ hasPack: true, attendedSessions: 1 }), true);
  });

  it("reste active lorsque les séances du pack sont terminées", () => {
    assert.equal(isPrimaryPackOperationallyActive({ hasPack: true, attendedSessions: 12 }), true);
  });

  it("reste inactive sans pack", () => {
    assert.equal(isPrimaryPackOperationallyActive({ hasPack: false, attendedSessions: 1 }), false);
  });

  it("un renouvellement attend sa propre présence, sans hériter de l'ancien pack", () => {
    const pack = {
      sessionCount: 1,
      category: null,
      courseQuotas: [{ courseSlug: "reformer", sessionCount: 1 }],
    };
    const enrollments = [
      {
        id: "old-enrollment",
        memberId: "member-1",
        packId: "pack-1",
        purchasedAt: new Date("2026-09-01T12:00:00.000Z"),
        closedAt: new Date("2026-10-01T12:00:00.000Z"),
        packStartedAt: new Date("2026-09-01T12:00:00.000Z"),
        status: "EXPIRED",
        additionalSessionsCredit: 0,
        pack,
      },
      {
        id: "renewal",
        memberId: "member-1",
        packId: "pack-1",
        purchasedAt: new Date("2026-10-02T12:00:00.000Z"),
        closedAt: null,
        packStartedAt: null,
        status: "PENDING_START",
        additionalSessionsCredit: 0,
        pack,
      },
    ];
    const previousAttendance = [
      {
        sessionDate: new Date("2026-09-15T12:00:00.000Z"),
        courseSlug: "reformer",
        debitedPackId: "pack-1",
      },
    ];

    const beforeRenewalAttendance = assignConsumedReservationsToEnrollments(
      enrollments,
      previousAttendance,
    );
    assert.equal(
      isPrimaryPackOperationallyActive({
        hasPack: true,
        attendedSessions: beforeRenewalAttendance.get("renewal")?.consumedTotal ?? 0,
      }),
      false,
    );

    const afterRenewalAttendance = assignConsumedReservationsToEnrollments(enrollments, [
      ...previousAttendance,
      {
        sessionDate: new Date("2026-10-03T12:00:00.000Z"),
        courseSlug: "reformer",
        debitedPackId: "pack-1",
      },
    ]);
    assert.equal(
      isPrimaryPackOperationallyActive({
        hasPack: true,
        attendedSessions: afterRenewalAttendance.get("renewal")?.consumedTotal ?? 0,
      }),
      true,
    );
  });
});

describe("classifyPrimaryPackKind vs prolongation", () => {
  it("reste Prolongé si prolongedAt est posé même avec une date de fin périmée", () => {
    assert.equal(
      classifyPrimaryPackKind({
        hasPack: true,
        packStartedAt: new Date("2026-06-25T00:00:00.000Z"),
        packExpiresAt: new Date("2026-08-18T00:00:00.000Z"),
        prolongedAt: new Date("2026-10-01T17:26:14.426Z"),
        consumedSessions: 10,
        totalSessions: 12,
        remainingSessions: 2,
      }),
      "prolonged",
    );
  });

  it("est Terminé à 12/12 même si le pack avait été prolongé", () => {
    assert.equal(
      classifyPrimaryPackKind({
        hasPack: true,
        packStartedAt: new Date("2026-06-25T00:00:00.000Z"),
        packExpiresAt: new Date("2026-08-18T00:00:00.000Z"),
        prolongedAt: new Date("2026-10-01T17:26:14.426Z"),
        consumedSessions: 12,
        totalSessions: 12,
        remainingSessions: 0,
      }),
      "finished",
    );
  });
});
