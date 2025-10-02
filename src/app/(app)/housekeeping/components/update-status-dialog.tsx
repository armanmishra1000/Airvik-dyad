"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Room, RoomStatus } from "@/data/types";

interface UpdateStatusDialogProps {
  room: Room;
  onUpdate: (newStatus: RoomStatus) => void;
  children: React.ReactNode;
}

const availableStatuses: RoomStatus[] = ["Clean", "Dirty", "Inspected", "Maintenance"];

export function UpdateStatusDialog({
  room,
  onUpdate,
  children,
}: UpdateStatusDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<RoomStatus>(
    room.status
  );

  React.useEffect(() => {
    if (open) {
      setSelectedStatus(room.status);
    }
  }, [open, room.status]);

  const handleSave = () => {
    onUpdate(selectedStatus);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Update Room {room.roomNumber} Status</DialogTitle>
          <DialogDescription>
            Select the new status for this room.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            defaultValue={room.status}
            onValueChange={(value: RoomStatus) => setSelectedStatus(value)}
          >
            {availableStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem value={status} id={`status-${status}`} />
                <Label htmlFor={`status-${status}`}>{status}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}