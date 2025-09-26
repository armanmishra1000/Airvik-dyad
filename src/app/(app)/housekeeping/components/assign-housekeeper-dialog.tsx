"use client";

import * as React from "react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockUsers, mockRoles } from "@/data";
import { useAppContext } from "@/context/app-context";

interface AssignHousekeeperDialogProps {
  roomId: string;
  currentAssigneeId?: string;
  children: React.ReactNode;
}

const housekeeperRole = mockRoles.find((r) => r.name === "Housekeeper");
const housekeepers = housekeeperRole
  ? mockUsers.filter((u) => u.roleId === housekeeperRole.id)
  : [];

export function AssignHousekeeperDialog({
  roomId,
  currentAssigneeId,
  children,
}: AssignHousekeeperDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | undefined>(
    currentAssigneeId
  );
  const { assignHousekeeper } = useAppContext();

  const handleSave = () => {
    if (!selectedUserId) {
      toast.error("Please select a housekeeper.");
      return;
    }
    assignHousekeeper({ roomId, userId: selectedUserId });
    const housekeeperName =
      housekeepers.find((h) => h.id === selectedUserId)?.name || "a housekeeper";
    toast.success(`Room assigned to ${housekeeperName}.`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Assign Housekeeper</DialogTitle>
          <DialogDescription>
            Choose a housekeeper to clean this room.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="housekeeper-select">Housekeeper</Label>
          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
          >
            <SelectTrigger id="housekeeper-select">
              <SelectValue placeholder="Select a housekeeper" />
            </SelectTrigger>
            <SelectContent>
              {housekeepers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}