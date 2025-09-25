"use client";

import * as React from "react";
import { mockRooms, mockRoomTypes } from "@/data";
import type { Room, RoomStatus } from "@/data";
import { HousekeepingToolbar } from "./components/housekeeping-toolbar";
import { RoomStatusCard } from "./components/room-status-card";

// Combine room data with room type details for easier display
const roomsWithDetails = mockRooms.map((room) => {
  const roomType = mockRoomTypes.find((rt) => rt.id === room.roomTypeId);
  return {
    ...room,
    roomTypeName: roomType?.name || "Unknown",
  };
});

export default function HousekeepingPage() {
  const [statusFilter, setStatusFilter] = React.useState<RoomStatus | "all">(
    "all"
  );

  const filteredRooms = React.useMemo(() => {
    if (statusFilter === "all") {
      return roomsWithDetails;
    }
    return roomsWithDetails.filter((room) => room.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="space-y-4">
      <HousekeepingToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map((room) => (
          <RoomStatusCard key={room.id} room={room} />
        ))}
      </div>
      {filteredRooms.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
            <p>No rooms match the selected status.</p>
        </div>
      )}
    </div>
  );
}