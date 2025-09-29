"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import type { RoomStatus } from "@/data/types";
import { HousekeepingToolbar } from "./components/housekeeping-toolbar";
import { RoomStatusCard } from "./components/room-status-card";
import { useDataContext } from "@/context/data-context";

export default function HousekeepingPage() {
  const {
    housekeepingAssignments,
    updateAssignmentStatus,
    rooms: allRooms,
    roomTypes,
    users,
    updateRoom,
  } = useDataContext();
  const [statusFilter, setStatusFilter] = React.useState<RoomStatus | "all">(
    "all"
  );

  const handleStatusUpdate = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await updateRoom(roomId, { status: newStatus });
      toast.success(`Room status updated to ${newStatus}.`);

      // If a room is marked clean, complete any pending assignment for today
      if (newStatus === "Clean") {
        updateAssignmentStatus(roomId, "Completed");
      }
    } catch (error) {
      toast.error("Failed to update room status.", {
        description: (error as Error).message,
      });
    }
  };

  const roomsWithDetails = React.useMemo(() => {
    const today = formatISO(new Date(), { representation: "date" });
    return allRooms.map((room) => {
      const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);
      const assignment = housekeepingAssignments.find(
        (a) => a.roomId === room.id && a.date === today
      );
      const housekeeper = assignment
        ? users.find((u) => u.id === assignment.assignedTo)
        : undefined;
      return {
        ...room,
        roomTypeName: roomType?.name || "Unknown",
        assignment,
        housekeeperName: housekeeper?.name,
      };
    });
  }, [allRooms, roomTypes, housekeepingAssignments, users]);

  const filteredRooms = React.useMemo(() => {
    if (statusFilter === "all") {
      return roomsWithDetails;
    }
    return roomsWithDetails.filter((room) => room.status === statusFilter);
  }, [statusFilter, roomsWithDetails]);

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