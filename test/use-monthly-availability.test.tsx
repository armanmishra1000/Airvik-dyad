import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach, type Mock } from "vitest";

import type { AvailabilityDay } from "@/data/types";

vi.mock("@/lib/api", () => ({
  getMonthlyAvailability: vi.fn(),
}));

import { mapMonthlyAvailabilityRow } from "@/lib/availability";
import { getMonthlyAvailability } from "@/lib/api";
import {
  useMonthlyAvailability,
  formatMonthStart,
} from "@/hooks/use-monthly-availability";

const mockedGetMonthlyAvailability =
  getMonthlyAvailability as unknown as Mock;

afterEach(() => {
  mockedGetMonthlyAvailability.mockReset();
});

describe("mapMonthlyAvailabilityRow", () => {
  it("normalizes availability arrays", () => {
    const sampleRow = {
      room_type_id: "room-type-1",
      room_type: {
        id: "room-type-1",
        name: "Deluxe",
        description: "Test",
        mainPhotoUrl: null,
        price: 100,
        rooms: [{ id: "room-1", roomNumber: "101" }],
        units: 1,
        sharedInventory: false,
      },
      availability: [
        {
          date: "2025-01-01",
          status: "free",
          unitsTotal: 1,
          bookedCount: 0,
          reservationIds: [],
          hasCheckIn: false,
          hasCheckOut: false,
          isClosed: false,
        },
      ] satisfies AvailabilityDay[],
    };

    const mapped = mapMonthlyAvailabilityRow(sampleRow);
    expect(mapped.roomType.id).toBe("room-type-1");
    expect(mapped.availability).toHaveLength(1);
  });

  it("falls back to an empty availability array", () => {
    const mapped = mapMonthlyAvailabilityRow({
      room_type_id: "room-type-2",
      room_type: {
        id: "room-type-2",
        name: "Standard",
        description: "",
        mainPhotoUrl: null,
        price: null,
        rooms: [],
        units: 0,
        sharedInventory: false,
      },
      availability: undefined as unknown as AvailabilityDay[],
    });

    expect(mapped.availability).toEqual([]);
  });
});

describe("useMonthlyAvailability", () => {
  it("loads data for the selected month", async () => {
    mockedGetMonthlyAvailability.mockResolvedValueOnce([]);

    const targetMonth = new Date("2025-03-15");
    const { result } = renderHook(() => useMonthlyAvailability(targetMonth));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockedGetMonthlyAvailability).toHaveBeenCalledWith(
      formatMonthStart(targetMonth),
      undefined
    );
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual([]);
  });

  it("captures RPC errors", async () => {
    mockedGetMonthlyAvailability.mockRejectedValueOnce(
      new Error("rpc failed")
    );

    const { result } = renderHook(() =>
      useMonthlyAvailability(new Date("2025-04-02"))
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
