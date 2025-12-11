import { describe, expect, it, vi } from "vitest";

import {
  isReservationRemovedDuringEdit,
  markReservationAsRemoved,
  RESERVATION_REMOVAL_FLAG,
} from "./filters";

describe("reservation removal helpers", () => {
  it("detects removal flag when present", () => {
    const entry = {
      externalMetadata: {
        [RESERVATION_REMOVAL_FLAG]: true,
      },
    };

    expect(isReservationRemovedDuringEdit(entry)).toBe(true);
  });

  it("treats missing or false flag as not removed", () => {
    expect(isReservationRemovedDuringEdit({ externalMetadata: null })).toBe(
      false
    );
    expect(
      isReservationRemovedDuringEdit({
        externalMetadata: { [RESERVATION_REMOVAL_FLAG]: false },
      })
    ).toBe(false);
  });

  it("marks metadata with flag and timestamp", () => {
    vi.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const result = markReservationAsRemoved(null);
    expect(result).toMatchObject({
      [RESERVATION_REMOVAL_FLAG]: true,
      removedAt: "2025-01-01T00:00:00.000Z",
    });
    vi.useRealTimers();
  });

  it("preserves existing metadata fields", () => {
    const metadata = { custom: "value" };
    const updated = markReservationAsRemoved(metadata, {
      timestamp: "2025-02-02T00:00:00.000Z",
    });
    expect(updated).toMatchObject({
      custom: "value",
      [RESERVATION_REMOVAL_FLAG]: true,
      removedAt: "2025-02-02T00:00:00.000Z",
    });
    expect(metadata).toEqual({ custom: "value" });
  });
});
