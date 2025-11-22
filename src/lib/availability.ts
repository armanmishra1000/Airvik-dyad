import type {
  AvailabilityDay,
  RoomAvailabilityMeta,
  RoomTypeAvailability,
} from "@/data/types";

export type MonthlyAvailabilityRow = {
  room_type_id: string;
  room_type: RoomAvailabilityMeta;
  availability?: AvailabilityDay[] | null;
};

export const mapMonthlyAvailabilityRow = (
  row: MonthlyAvailabilityRow
): RoomTypeAvailability => ({
  roomType: row.room_type,
  availability: row.availability ?? [],
});

export const hasClosedDays = (
  days: AvailabilityDay[] | null | undefined
): boolean => {
  if (!Array.isArray(days) || days.length === 0) {
    return false;
  }

  return days.some((day) => day.isClosed);
};
