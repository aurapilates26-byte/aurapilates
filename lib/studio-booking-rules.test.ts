import { describe, expect, it } from "vitest";
import {
  isMemberCancellationRefundable,
  isMemberReservationDeskOpen,
  memberLateCancellationNoticeFr,
  MEMBER_LATE_CANCELLATION_HOURS,
} from "./studio-booking-rules";

describe("isMemberCancellationRefundable", () => {
  const classStart = new Date(2026, 5, 10, 10, 0, 0);

  it("rend la séance si règle désactivée, même en annulation tardive", () => {
    const now = new Date(2026, 5, 10, 9, 30, 0);
    expect(
      isMemberCancellationRefundable({
        asAdmin: false,
        wasWaitlist: false,
        lateCancellationRuleEnabled: false,
        classStart,
        now,
      }),
    ).toBe(true);
  });

  it("respecte la fenêtre de 6 h quand la règle est activée", () => {
    const early = new Date(classStart.getTime() - MEMBER_LATE_CANCELLATION_HOURS * 60 * 60 * 1000);
    const late = new Date(classStart.getTime() - (MEMBER_LATE_CANCELLATION_HOURS * 60 * 60 * 1000 - 1));

    expect(
      isMemberCancellationRefundable({
        asAdmin: false,
        wasWaitlist: false,
        lateCancellationRuleEnabled: true,
        classStart,
        now: early,
      }),
    ).toBe(true);

    expect(
      isMemberCancellationRefundable({
        asAdmin: false,
        wasWaitlist: false,
        lateCancellationRuleEnabled: true,
        classStart,
        now: late,
      }),
    ).toBe(false);
  });

  it("admin annule toujours avec remboursement", () => {
    const now = new Date(classStart.getTime() - 60 * 1000);
    expect(
      isMemberCancellationRefundable({
        asAdmin: true,
        wasWaitlist: false,
        lateCancellationRuleEnabled: true,
        classStart,
        now,
      }),
    ).toBe(true);
  });
});

describe("memberLateCancellationNoticeFr", () => {
  const baseRules = {
    lateCancellationRuleEnabled: true,
    lateCancellationHours: 6,
    memberReservationOpenTime: "08:00",
    memberReservationCloseTime: "22:00",
  };

  it("affiche le délai quand la règle est activée", () => {
    expect(memberLateCancellationNoticeFr(baseRules)).toContain("6 heures");
  });

  it("indique le remboursement total quand la règle est désactivée", () => {
    expect(memberLateCancellationNoticeFr({ ...baseRules, lateCancellationRuleEnabled: false })).toContain(
      "Toute annulation",
    );
  });
});

describe("isMemberReservationDeskOpen", () => {
  const rules = {
    lateCancellationRuleEnabled: true,
    lateCancellationHours: 6,
    memberReservationOpenTime: "08:00",
    memberReservationCloseTime: "22:00",
  };

  it("accepte une heure dans la plage", () => {
    expect(isMemberReservationDeskOpen(rules, new Date(2026, 5, 22, 15, 10, 0))).toBe(true);
  });

  it("refuse avant ouverture", () => {
    expect(isMemberReservationDeskOpen(rules, new Date(2026, 5, 22, 7, 30, 0))).toBe(false);
  });

  it("refuse après fermeture", () => {
    expect(isMemberReservationDeskOpen(rules, new Date(2026, 5, 22, 22, 30, 0))).toBe(false);
  });
});
