"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RoomStatus } from "@/data/types";

interface HousekeepingToolbarProps {
  statusFilter: RoomStatus | "all";
  onStatusChange: (status: RoomStatus | "all") => void;
}

const statuses: (RoomStatus | "all")[] = ["all", "Clean", "Dirty", "Inspected", "Maintenance"];

export function HousekeepingToolbar({
  statusFilter,
  onStatusChange,
}: HousekeepingToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <ToggleGroup
        type="single"
        value={statusFilter}
        onValueChange={(value) => {
          if (value) onStatusChange(value as RoomStatus | "all");
        }}
      >
        {statuses.map(status => (
            <ToggleGroupItem key={status} value={status} aria-label={`Filter by ${status}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}