import type { SupabaseClient } from "@supabase/supabase-js";

type DbRoomRecord = {
  id: string;
  room_number: string | null;
};

export async function fetchRoomNumberMap(
  client: SupabaseClient
): Promise<Map<string, string>> {
  const { data, error } = await client.from("rooms").select("id, room_number");

  if (error) {
    throw error;
  }

  const map = new Map<string, string>();
  (data as DbRoomRecord[] | null)?.forEach((room) => {
    const normalized = normalizeRoomNumber(room.room_number);
    if (normalized && room.id && !map.has(normalized)) {
      map.set(normalized, room.id);
    }
  });

  return map;
}

export function normalizeRoomNumber(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export function assignRoomIdsFromNumbers<T>(
  items: T[],
  roomNumberMap: Map<string, string>,
  getKey: (item: T) => string,
  getRoomNumber: (item: T) => string | null | undefined
): Map<string, string> {
  const assignments = new Map<string, string>();

  items.forEach((item) => {
    const normalized = normalizeRoomNumber(getRoomNumber(item));
    if (!normalized) {
      return;
    }
    const roomId = roomNumberMap.get(normalized);
    if (roomId) {
      assignments.set(getKey(item), roomId);
    }
  });

  return assignments;
}
