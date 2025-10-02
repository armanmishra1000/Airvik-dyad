"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RoomStatus } from "@/data/types";

interface HousekeepingToolbarProps {
  statusFilter: RoomStatus | "all";
  onStatusChange: (status: RoomStatus | "all") => void;
}

const statuses: (RoomStatus | "all")[] = ["all", "Clean", "Dirty", "Inspected", "Maintenance"];

/**
 * Render a toolbar with a single-select toggle group for filtering rooms by housekeeping status.
 *
 * @param statusFilter - The currently selected status filter (`RoomStatus` or `"all"`).
 * @param onStatusChange - Callback invoked with the new status (`RoomStatus` or `"all"`) when the selection changes.
 * @returns The toolbar element containing the status toggle group.
 */
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