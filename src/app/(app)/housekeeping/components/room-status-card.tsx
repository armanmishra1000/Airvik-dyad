"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Room, RoomStatus, HousekeepingAssignment } from "@/data/types";
import { User, Wrench } from "lucide-react";
import { UpdateStatusDialog } from "./update-status-dialog";
import { AssignHousekeeperDialog } from "./assign-housekeeper-dialog";

interface RoomWithDetails extends Room {
  roomTypeName: string;
  assignment?: HousekeepingAssignment;
  housekeeperName?: string;
}

interface RoomStatusCardProps {
  room: RoomWithDetails;
  onStatusUpdate: (roomId: string, newStatus: RoomStatus) => void;
}

const statusStyles: {
  [key in RoomStatus]: {
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
  };
} = {
  Clean: { variant: "default", label: "Clean" },
  Inspected: { variant: "default", label: "Inspected" },
  Dirty: { variant: "destructive", label: "Dirty" },
  Maintenance: { variant: "outline", label: "Maintenance" },
};

/**
 * Render a card showing a room's status, current assignment (when applicable), and available actions.
 *
 * @param room - The room data to display, including derived fields (`roomTypeName`, optional `assignment`, and optional `housekeeperName`)
 * @param onStatusUpdate - Callback invoked with the room's id and the newly selected status when the status is changed
 * @returns The card element representing the room's status, assignment information, and action controls
 */
export function RoomStatusCard({ room, onStatusUpdate }: RoomStatusCardProps) {
  const { variant, label } = statusStyles[room.status];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Room {room.roomNumber}</CardTitle>
            <CardDescription>{room.roomTypeName}</CardDescription>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {room.assignment && room.status === "Dirty" ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>
              Assigned to: <strong>{room.housekeeperName}</strong> (
              {room.assignment.status})
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Vacant</div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {room.status === "Dirty" && (
          <AssignHousekeeperDialog
            roomId={room.id}
            currentAssigneeId={room.assignment?.assignedTo}
          >
            <Button variant="secondary" size="sm">
              {room.assignment ? "Re-assign" : "Assign"}
            </Button>
          </AssignHousekeeperDialog>
        )}
        <UpdateStatusDialog
          room={room}
          onUpdate={(newStatus) => onStatusUpdate(room.id, newStatus)}
        >
          <Button variant="outline" size="sm">
            Update Status
          </Button>
        </UpdateStatusDialog>
      </CardFooter>
    </Card>
  );
}