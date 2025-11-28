import type { Room, RoomStatus } from "@/data/types";

export const BOOKABLE_ROOM_STATUSES: readonly RoomStatus[] = [
  "Clean",
  "Dirty",
  "Inspected",
];

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  Clean: "Clean",
  Dirty: "Dirty",
  Inspected: "Inspected",
  Maintenance: "Maintenance",
};

export const isBookableRoom = (room: Pick<Room, "status">): boolean =>
  BOOKABLE_ROOM_STATUSES.includes(room.status);

export const getRoomStatusLabel = (status: RoomStatus): string =>
  ROOM_STATUS_LABELS[status];
