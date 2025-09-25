"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import { mockRooms, mockRoomTypes, mockUsers } from "@/data";
import type { RoomStatus } from "@/data";
import { HousekeepingToolbar } from "./components/housekeeping-toolbar";
import { RoomStatusCard } from "./components/room-status-card";
import { useAppContext } from "@/context/app-context";

export default function HousekeepingPage() {
  const { housekeepingAssignments, updateAssignmentStatus } = useAppContext();
  const [rooms, setRooms] = React.useState(() =>
    mockRooms.map((room) => {
      const roomType = mockRoomTypes.find((rt) => rt.id === room.roomTypeId);
      return {
        ...room,
        roomTypeName: roomType?.name || "Unknown",
      };
    })
  );
  const [statusFilter, setStatusFilter] = React.useState<RoomStatus | "all">(
    "all"
  );

  const handleStatusUpdate = (roomId: string, newStatus: RoomStatus) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, status: newStatus } : room
      )
    );
    // If a room is marked clean, complete any pending assignment for today
    if (newStatus === "Clean") {
      updateAssignmentStatus(roomId, "Completed");
    }
  };

  const roomsWithAssignments = React.useMemo(() => {
    const today = formatISO(new Date(), { representation: "date" });
    return rooms.map((room) => {
      const assignment = housekeepingAssignments.find(
        (a) => a.roomId === room.id && a.date === today
      );
      const housekeeper = assignment
        ? mockUsers.find((u) => u.id === assignment.assignedTo)
        : undefined;
      return {
        ...room,
        assignment,
        housekeeperName: housekeeper?.name,
      };
    });
  }, [rooms, housekeepingAssignments]);

  const filteredRooms = React.useMemo(() => {
    if (statusFilter === "all") {
      return roomsWithAssignments;
    }
    return roomsWithAssignments.filter((room) => room.status === statusFilter);
  }, [statusFilter, roomsWithAssignments]);

  return (
    <div className="space-y-4">
      <HousekeepingToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map((room) => (
          <RoomStatusCard
            key={room.id}
            room={room}
            onStatusUpdate={handleStatusUpdate}
          />
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