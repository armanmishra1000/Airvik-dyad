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
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
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
    className: string;
    label: string;
  };
} = {
  Clean: {
    className:
      "border border-accent/50 bg-accent/30 text-accent-foreground",
    label: "Clean",
  },
  Inspected: {
    className:
      "border border-primary/40 bg-primary/10 text-primary",
    label: "Inspected",
  },
  Dirty: {
    className:
      "border border-destructive/40 bg-destructive/10 text-destructive",
    label: "Dirty",
  },
  Maintenance: {
    className:
      "border border-secondary/50 bg-secondary/30 text-secondary-foreground",
    label: "Maintenance",
  },
};

/**
 * Render a card showing a room's number, type, current status badge, assignment (if any), and actions to assign a housekeeper or update the room status.
 *
 * @param room - Room data including status and optional housekeeping assignment used to determine the badge styling, content area, and available actions.
 * @param onStatusUpdate - Callback invoked with the room id and the chosen new status when the room's status is updated.
 * @returns The card element representing the room's status, assignment state, and action buttons.
 */
export function RoomStatusCard({ room, onStatusUpdate }: RoomStatusCardProps) {
  const { className, label } = statusStyles[room.status];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-serif text-lg font-semibold">Room {room.roomNumber}</CardTitle>
            <CardDescription>{room.roomTypeName}</CardDescription>
          </div>
          <Badge
            className={cn(
              "self-start rounded-full px-3 py-1 text-xs font-medium",
              className
            )}
          >
            {label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {room.assignment && room.status === "Dirty" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm">
            <User className="h-4 w-4" />
            <span className="font-medium text-foreground">
              Assigned to: <span className="font-semibold">{room.housekeeperName}</span> ({room.assignment.status})
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/50 px-4 py-3 text-sm text-muted-foreground">
            Vacant
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
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