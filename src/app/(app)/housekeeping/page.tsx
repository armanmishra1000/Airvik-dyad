"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import type { RoomStatus } from "@/data/types";
import { HousekeepingToolbar } from "./components/housekeeping-toolbar";
import { RoomStatusCard } from "./components/room-status-card";
import { useDataContext } from "@/context/data-context";

/**
 * Render the housekeeping dashboard with a status filter, room cards, and an empty-state display.
 *
 * The page shows a toolbar to select which room statuses to view, a responsive grid of RoomStatusCard
 * components for the filtered rooms, and a styled empty-state message when no rooms match the filter.
 * Updating a room's status from a card will update the room, display a success or error toast, and,
 * if the new status is `Clean`, mark the day's housekeeping assignment for that room as `Completed`.
 *
 * @returns The React element for the housekeeping page.
 */
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
    <div className="space-y-6">
      <HousekeepingToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map((room) => (
          <RoomStatusCard
            key={room.id}
            room={room}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>
      {filteredRooms.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/40 bg-card/60 py-16 text-center text-muted-foreground">
          <p className="text-sm font-medium uppercase tracking-wide">
            No rooms match the selected status
          </p>
        </div>
      )}
    </div>
  );
}