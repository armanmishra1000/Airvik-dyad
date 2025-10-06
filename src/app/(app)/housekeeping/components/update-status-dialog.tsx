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

const availableStatuses: RoomStatus[] = [
  "Clean",
  "Dirty",
  "Inspected",
  "Maintenance",
];

/**
 * Render a controlled dialog that lets the user choose and save a new status for a room.
 *
 * The dialog initializes its selection from `room.status` each time it opens. Clicking the provided
 * `children` opens the dialog; clicking "Save Changes" invokes `onUpdate` with the chosen status and closes the dialog.
 *
 * @param room - The room being updated; its `roomNumber` is shown in the title and its `status` initializes the selection.
 * @param onUpdate - Callback invoked with the newly selected `RoomStatus` when the user saves.
 * @param children - Element that acts as the trigger to open the dialog.
 * @returns The rendered dialog React element.
 */
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg font-semibold">
            Update Room {room.roomNumber} Status
          </DialogTitle>
          <DialogDescription>
            Select the new status for this room.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <RadioGroup
            value={selectedStatus}
            onValueChange={(value: RoomStatus) => setSelectedStatus(value)}
            className="space-y-3"
          >
            {availableStatuses.map((status) => (
              <div
                key={status}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/80 px-4 py-3"
              >
                <RadioGroupItem value={status} id={`status-${status}`} />
                <Label htmlFor={`status-${status}`} className="text-sm font-medium">
                  {status}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}