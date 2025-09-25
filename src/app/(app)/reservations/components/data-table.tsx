"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
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
import { ReservationDetailsDrawer } from "./reservation-details-drawer"
import { ReservationWithDetails } from "./columns"
import { CancelReservationDialog } from "./cancel-reservation-dialog"

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      viewReservation: (reservation: TData) => void
      cancelReservation: (reservationId: string) => void
      checkInReservation: (reservationId: string) => void
      checkOutReservation: (reservationId: string) => void
      openCancelDialog: (reservationId: string) => void
    }
  }

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onCancelReservation: (reservationId: string) => void
  onCheckInReservation: (reservationId: string) => void
  onCheckOutReservation: (reservationId: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onCancelReservation,
  onCheckInReservation,
  onCheckOutReservation,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [selectedReservation, setSelectedReservation] = React.useState<ReservationWithDetails | null>(null);
  const [reservationToCancel, setReservationToCancel] = React.useState<string | null>(null);

  const handleOpenCancelDialog = (reservationId: string) => {
    setReservationToCancel(reservationId);
  };

  const handleConfirmCancellation = () => {
    if (reservationToCancel) {
      onCancelReservation(reservationToCancel);
    }
    setReservationToCancel(null);
  };


  const table = useReactTable({
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    meta: {
        viewReservation: (reservation) => {
            setSelectedReservation(reservation as ReservationWithDetails)
        },
        cancelReservation: onCancelReservation,
        checkInReservation: onCheckInReservation,
        checkOutReservation: onCheckOutReservation,
        openCancelDialog: handleOpenCancelDialog,
    }
  })

  return (
    <div className="space-y-4">
        <DataTableToolbar table={table} />
      <div className="rounded-md border">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <ReservationDetailsDrawer 
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        reservation={selectedReservation}
        onCancelReservation={table.options.meta?.cancelReservation}
        onCheckInReservation={table.options.meta?.checkInReservation}
        onCheckOutReservation={table.options.meta?.checkOutReservation}
        onOpenCancelDialog={table.options.meta?.openCancelDialog}
      />
      <CancelReservationDialog
        isOpen={!!reservationToCancel}
        onOpenChange={(isOpen) => !isOpen && setReservationToCancel(null)}
        onConfirm={handleConfirmCancellation}
      />
    </div>
  )
}