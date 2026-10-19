import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyPrimaryPackKind,
  hasConsumedPrimaryPackSessions,
} from "./member-primary-pack-state";

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

describe("hasConsumedPrimaryPackSessions", () => {
  it("reste inactive tant qu'aucune séance d'un pack à quota n'a été débitée", () => {
    assert.equal(
      hasConsumedPrimaryPackSessions({
        totalSessions: 6,
        remainingSessions: 6,
        packStartedAt: null,
      }),
      false,
    );
  });

  it("devient active dès qu'une séance du pack a été débitée", () => {
    assert.equal(
      hasConsumedPrimaryPackSessions({
        totalSessions: 6,
        remainingSessions: 5,
        packStartedAt: new Date("2026-10-01T00:00:00.000Z"),
      }),
      true,
    );
  });

  it("reste active si la dernière séance du pack a été consommée", () => {
    assert.equal(
      hasConsumedPrimaryPackSessions({
        totalSessions: 1,
        remainingSessions: 0,
        packStartedAt: new Date("2026-10-01T00:00:00.000Z"),
      }),
      true,
    );
  });

  it("utilise le démarrage du pack lorsque celui-ci n'a pas de quota de séances", () => {
    assert.equal(
      hasConsumedPrimaryPackSessions({
        totalSessions: null,
        remainingSessions: 0,
        packStartedAt: null,
      }),
      false,
    );
    assert.equal(
      hasConsumedPrimaryPackSessions({
        totalSessions: null,
        remainingSessions: 0,
        packStartedAt: new Date("2026-10-01T00:00:00.000Z"),
      }),
      true,
    );
  });
});
