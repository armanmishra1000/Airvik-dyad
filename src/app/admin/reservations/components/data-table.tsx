"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
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
import { formatBookingCode } from "@/lib/reservations/formatting"
import { GeistSpinner } from "@/components/shared/vercel-spinner"
interface DataTableProps {
  columns: ColumnDef<ReservationWithDetails, unknown>[]
  data: ReservationWithDetails[]
  onCancelReservation: (bookingId: string) => Promise<void> | void
  onCheckInReservation: (reservationId: string) => void
  onCheckOutReservation: (reservationId: string) => void
  onRefresh?: () => void
  isLoading?: boolean
  isRefreshing?: boolean
  isBackgroundLoading?: boolean
  totalCount?: number
}

export function DataTable({
  columns,
  data,
  onCancelReservation,
  onCheckInReservation,
  onCheckOutReservation,
  onRefresh,
  isLoading,
  isRefreshing,
  isBackgroundLoading,
  totalCount,
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
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [reservationToCancel, setReservationToCancel] =
    React.useState<ReservationWithDetails | null>(null)

  const handleOpenCancelDialog = (reservation: ReservationWithDetails) => {
    setReservationToCancel(reservation)
  }

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

      const bookingIdentifier = String(row.original.bookingId ?? row.getValue("id") ?? "")
      const bookingIdRaw = bookingIdentifier.toLowerCase()
      const normalizedBookingId = bookingIdentifier
        .replace(/^booking-/i, "")
        .replace(/^vik-/i, "")
        .toLowerCase()
      const formattedBookingId = formatBookingCode(bookingIdentifier).toLowerCase()
      const guestName = String(row.original.guestName ?? row.getValue("guestName") ?? "")
        .trim()
        .toLowerCase()

      const matchesCurrent =
        bookingIdRaw.includes(term) ||
        normalizedBookingId.includes(term) ||
        formattedBookingId.includes(term) ||
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
    onPaginationChange: setPagination,
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
    autoResetAll: false,
    autoResetPageIndex: false,
    autoResetExpanded: false,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      expanded,
      pagination,
    },
    meta: {
        checkInReservation: (res: ReservationWithDetails) =>
          handleGroupAction(res, onCheckInReservation),
        checkOutReservation: (res: ReservationWithDetails) =>
          handleGroupAction(res, onCheckOutReservation),
        openCancelDialog: handleOpenCancelDialog,
    }
  })

  const hasRows = table.getRowModel().rows?.length > 0
  const showLoadingState = Boolean(isLoading) && !hasRows

  return (
    <div className="space-y-6">
      <DataTableToolbar
        table={table}
        totalCount={totalCount}
        onRefresh={onRefresh}
        isRefreshing={Boolean(isRefreshing)}
        isLoading={Boolean(isLoading)}
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
            {showLoadingState ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                    <GeistSpinner size={36} label="Loading reservations" />
                    <p className="text-sm">Loading reservations…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : hasRows ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {isBackgroundLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-4 text-center text-sm text-muted-foreground"
                    >
                      Loading older reservations…
                    </TableCell>
                  </TableRow>
                ) : null}
              </>
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
      <DataTablePagination table={table} totalCount={totalCount} />
      <CancelReservationDialog
        isOpen={!!reservationToCancel}
        onOpenChange={(isOpen) => !isOpen && setReservationToCancel(null)}
        onConfirm={handleConfirmCancellation}
      />
    </div>
  )
}
