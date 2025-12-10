"use client"

import { Table } from "@tanstack/react-table"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { statuses } from "./columns"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  viewMode: "flat" | "grouped"
  onViewModeChange: (mode: "flat" | "grouped") => void
  reservationCount: number
  bookingCount: number
}

export function DataTableToolbar<TData>({
  table,
  viewMode,
  onViewModeChange,
  reservationCount,
  bookingCount,
}: DataTableToolbarProps<TData>) {
  const handleViewChange = (value: string) => {
    if (value === "flat" || value === "grouped") {
      onViewModeChange(value)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter by guest name..."
          value={(table.getColumn("guestName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("guestName")?.setFilterValue(event.target.value)
          }
          className="w-full sm:w-[220px] lg:w-[280px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={handleViewChange}
            aria-label="Reservation row grouping"
            className="gap-2"
          >
            <ToggleGroupItem value="flat" className="text-xs">
              All reservations
            </ToggleGroupItem>
            <ToggleGroupItem value="grouped" className="text-xs">
              Group by booking
            </ToggleGroupItem>
          </ToggleGroup>
          <span className="text-xs text-muted-foreground">
            {reservationCount} reservations • {bookingCount} booking rows
          </span>
        </div>
        <DataTableViewOptions table={table} />
        <Button asChild>
          <Link href="/admin/reservations/new">Add Reservation</Link>
        </Button>
      </div>
    </div>
  )
}
