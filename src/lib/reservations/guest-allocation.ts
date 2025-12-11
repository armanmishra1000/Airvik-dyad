export type RoomGuestAllocation = {
  adults: number;
  children: number;
};

export type RoomOccupancyAssignment = RoomGuestAllocation & {
  roomId?: string;
};

function distributeCount(total: number, slots: number): number[] {
  if (slots <= 0) return [];
  const base = Math.floor(total / slots);
  const remainder = total % slots;
  return Array.from({ length: slots }, (_, index) =>
    base + (index < remainder ? 1 : 0)
  );
}

export function distributeGuestsAcrossRooms(
  totalAdults: number,
  totalChildren: number,
  roomCount: number
): RoomGuestAllocation[] {
  if (roomCount <= 0) {
    return [];
  }

  const adultsPerRoom = distributeCount(Math.max(totalAdults, 0), roomCount);
  const childrenPerRoom = distributeCount(Math.max(totalChildren, 0), roomCount);

  return adultsPerRoom.map((adults, index) => ({
    adults,
    children: childrenPerRoom[index] ?? 0,
  }));
}

export function buildRoomOccupancyAssignments(
  roomIds: string[],
  totalAdults: number,
  totalChildren: number
): RoomOccupancyAssignment[] {
  const allocations = distributeGuestsAcrossRooms(
    totalAdults,
    totalChildren,
    roomIds.length
  );

  return allocations.map((allocation, index) => ({
    ...allocation,
    roomId: roomIds[index],
  }));
}
