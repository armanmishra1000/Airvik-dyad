import { describe, expect, it } from "vitest";

import {
  ACTIVE_RESERVATION_STATUSES,
  hasActiveReservations,
  isActiveReservationStatus,
  resolveAggregateStatus,
} from "./status";

describe("reservation status helpers", () => {
  it("identifies active statuses", () => {
    for (const status of ACTIVE_RESERVATION_STATUSES) {
      expect(isActiveReservationStatus(status)).toBe(true);
    }
    expect(isActiveReservationStatus("Cancelled")).toBe(false);
    expect(isActiveReservationStatus("No-show")).toBe(false);
  });

  it("detects when a list contains active reservations", () => {
    expect(hasActiveReservations(["Cancelled", "No-show"])).toBe(false);
    expect(hasActiveReservations(["Cancelled", "Confirmed"])).toBe(true);
  });

  it("resolves aggregate status by priority", () => {
    expect(
      resolveAggregateStatus(["Tentative", "Confirmed", "Checked-in"])
    ).toBe("Checked-in");
    expect(resolveAggregateStatus(["Cancelled", "No-show"])).toBe("Cancelled");
    expect(resolveAggregateStatus([])).toBe("Cancelled");
  });
});
