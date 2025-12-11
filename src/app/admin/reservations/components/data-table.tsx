"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "./data-table-pagination"
import { CancelReservationDialog } from "./cancel-reservation-dialog"
import type { ReservationWithDetails } from "./columns"
interface DataTableProps {
  columns: ColumnDef<ReservationWithDetails, unknown>[]
  data: ReservationWithDetails[]
  onCancelReservation: (bookingId: string) => Promise<void> | void
  onCheckInReservation: (reservationId: string) => void
  onCheckOutReservation: (reservationId: string) => void
}

export function DataTable({
  columns,
  data,
  onCancelReservation,
  onCheckInReservation,
  onCheckOutReservation,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "bookingDate", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [reservationToCancel, setReservationToCancel] =
    React.useState<ReservationWithDetails | null>(null)

  const handleOpenCancelDialog = (reservation: ReservationWithDetails) => {
    setReservationToCancel(reservation);
  };

  const handleConfirmCancellation = () => {
    if (!reservationToCancel) {
      return
    }

    const bookingId = reservationToCancel.bookingId ?? reservationToCancel.id
    void onCancelReservation(bookingId)
    setReservationToCancel(null)
  };

  const handleGroupAction = (
    reservation: ReservationWithDetails,
    action: (id: string) => void
  ) => {
    const reservations = reservation.subRows?.length
      ? reservation.subRows
      : [reservation]

    reservations.forEach((item) => action(item.id))
  }

  const reservationGlobalFilter = React.useCallback(
    (row: Row<ReservationWithDetails>, _columnId: string, filterValue: string): boolean => {
      const term = String(filterValue ?? "").trim().toLowerCase()
      if (!term) return true

      const bookingIdRaw = String(row.original.bookingId ?? row.getValue("id") ?? "").toLowerCase()
      const normalizedBookingId = bookingIdRaw
        .replace(/^booking-/i, "")
        .replace(/^vik-/i, "")
      const guestName = String(row.original.guestName ?? row.getValue("guestName") ?? "")
        .trim()
        .toLowerCase()

      const matchesCurrent =
        bookingIdRaw.includes(term) ||
        normalizedBookingId.includes(term) ||
        guestName.includes(term)

      if (matchesCurrent) return true

      if (row.subRows?.length) {
        return row.subRows.some((subRow) =>
          reservationGlobalFilter(subRow as Row<ReservationWithDetails>, _columnId, term)
        )
      }

      return false
    },
    []
  )

  const table = useReactTable<ReservationWithDetails>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: reservationGlobalFilter,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      expanded,
    },
    meta: {
        checkInReservation: (res: ReservationWithDetails) =>
          handleGroupAction(res, onCheckInReservation),
        checkOutReservation: (res: ReservationWithDetails) =>
          handleGroupAction(res, onCheckOutReservation),
        openCancelDialog: handleOpenCancelDialog,
    }
  })

  return (
    <div className="space-y-6">
      <DataTableToolbar
        table={table}
        bookingCount={data.length}
      />
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <CancelReservationDialog
        isOpen={!!reservationToCancel}
        onOpenChange={(isOpen) => !isOpen && setReservationToCancel(null)}
        onConfirm={handleConfirmCancellation}
      />
    </div>
  )
}
