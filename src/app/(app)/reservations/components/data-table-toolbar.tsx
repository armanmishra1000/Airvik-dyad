"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { CreateReservationDialog } from "./create-reservation-dialog"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { statuses } from "./columns"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
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
        <DataTableViewOptions table={table} />
        <CreateReservationDialog />
      </div>
    </div>
  )
}