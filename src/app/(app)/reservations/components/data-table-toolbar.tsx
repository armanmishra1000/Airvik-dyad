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

/**
 * Renders a toolbar with filtering and action controls for the given table.
 *
 * The toolbar binds an input to the table's "guestName" column filter, conditionally renders a faceted "status" filter if that column exists, and provides view options and a create-reservation dialog.
 *
 * @param table - Table instance whose columns and filter state are used by the toolbar controls.
 * @returns A JSX element containing the toolbar controls for the provided table.
 */
export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by guest name..."
          value={(table.getColumn("guestName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("guestName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <CreateReservationDialog />
      </div>
    </div>
  )
}