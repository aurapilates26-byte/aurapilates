import { describe, expect, it } from "vitest";
import {
  isMemberCancellationRefundable,
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
  it("affiche le délai quand la règle est activée", () => {
    expect(memberLateCancellationNoticeFr({ lateCancellationRuleEnabled: true, lateCancellationHours: 6 })).toContain(
      "6 heures",
    );
  });

  it("indique le remboursement total quand la règle est désactivée", () => {
    expect(memberLateCancellationNoticeFr({ lateCancellationRuleEnabled: false, lateCancellationHours: 6 })).toContain(
      "Toute annulation",
    );
  });
});
