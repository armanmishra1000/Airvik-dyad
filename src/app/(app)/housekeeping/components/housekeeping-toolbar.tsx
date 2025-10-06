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
    <div className="rounded-2xl border border-border/40 bg-card/80 px-4 py-3 shadow-sm">
      <ToggleGroup
        type="single"
        value={statusFilter}
        onValueChange={(value) => {
          if (value) onStatusChange(value as RoomStatus | "all");
        }}
        className="flex flex-wrap gap-2"
      >
        {statuses.map((status) => (
          <ToggleGroupItem
            key={status}
            value={status}
            aria-label={`Filter by ${status}`}
            className="capitalize"
          >
            {status}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}