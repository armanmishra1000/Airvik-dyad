"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { statuses } from "./columns"
import { Button } from "@/components/ui/button"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  bookingCount: number
}

export function DataTableToolbar<TData>({
  table,
  bookingCount,
}: DataTableToolbarProps<TData>) {
  const guestColumn = table.getColumn("guestName")
  const bookingColumn = table.getColumn("id")
  const searchValue =
    (guestColumn?.getFilterValue() as string) ||
    (bookingColumn?.getFilterValue() as string) ||
    ""

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    guestColumn?.setFilterValue(value)
    bookingColumn?.setFilterValue(value)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search guest or booking ID..."
          aria-label="Search by guest name or booking ID"
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full sm:w-[280px] lg:w-[340px]"
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
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {bookingCount} booking{bookingCount === 1 ? "" : "s"}
        </span>
        <DataTableViewOptions table={table} />
        <Button asChild>
          <Link href="/admin/reservations/new">Add Reservation</Link>
        </Button>
      </div>
    </div>
  )
}
