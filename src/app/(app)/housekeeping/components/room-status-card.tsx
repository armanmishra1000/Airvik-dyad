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
import type { Room, RoomStatus } from "@/data";
import { BedDouble, User, Wrench } from "lucide-react";
import { UpdateStatusDialog } from "./update-status-dialog";

interface RoomWithDetails extends Room {
  roomTypeName: string;
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

export function RoomStatusCard({ room, onStatusUpdate }: RoomStatusCardProps) {
  const { variant, label } = statusStyles[room.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Room {room.roomNumber}</CardTitle>
            <CardDescription>{room.roomTypeName}</CardDescription>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Placeholder for guest name if occupied */}
        <div className="text-sm text-muted-foreground">Vacant</div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <UpdateStatusDialog
          room={room}
          onUpdate={(newStatus) => onStatusUpdate(room.id, newStatus)}
        >
          <Button variant="outline" size="sm">
            Update Status
          </Button>
        </UpdateStatusDialog>
        {room.status !== "Maintenance" && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Wrench className="h-4 w-4" />
            <span className="sr-only">Request Maintenance</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}