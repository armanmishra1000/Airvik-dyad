"use client"

import * as React from "react"
import {
  ColumnDef,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/app/admin/reservations/components/data-table-pagination"
import { GuestFormDialog } from "./guest-form-dialog"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"
import { useDataContext } from "@/context/data-context"
import { useAuthContext } from "@/context/auth-context"
import type { Guest } from "@/data/types"

export function GuestsDataTable<TData extends Guest, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [guestToDelete, setGuestToDelete] = React.useState<TData | null>(null)
  const { deleteGuest } = useDataContext()
  const { hasPermission } = useAuthContext()

  const handleDeleteConfirm = async () => {
    if (guestToDelete) {
      const success = await deleteGuest(guestToDelete.id);
      if (success) {
        toast.success(`Guest "${guestToDelete.firstName} ${guestToDelete.lastName}" has been deleted.`);
      } else {
        toast.error("Failed to delete guest.", {
          description: "This guest has active reservations and cannot be deleted.",
        });
      }
      setGuestToDelete(null);
    }
  }

  const guestNameGlobalFilter = React.useCallback(
    (row: Row<TData>, _columnId: string, filterValue: string): boolean => {
      const term = String(filterValue ?? "")
        .trim()
        .toLowerCase()

      if (!term) {
        return true
      }

      const firstName = String(row.original.firstName ?? "")
        .trim()
        .toLowerCase()
      const lastName = String(row.original.lastName ?? "")
        .trim()
        .toLowerCase()

      const fullName = `${firstName} ${lastName}`.trim()
      const reverseName = `${lastName} ${firstName}`.trim()

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        fullName.includes(term) ||
        reverseName.includes(term)
      )
    },
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: guestNameGlobalFilter,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    meta: {
      openDeleteDialog: (guest: TData) => {
        setGuestToDelete(guest)
      },
      hasPermission,
    },
  })

  const searchValue = String(table.getState().globalFilter ?? "")

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.setGlobalFilter(event.target.value)
    table.setPageIndex(0)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search guests..."
            aria-label="Search guests by name"
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full sm:w-[280px] lg:w-[340px]"
          />
          <div className="flex items-center justify-end gap-3">
            {hasPermission("create:guest") && (
              <GuestFormDialog>
                <Button>Add Guest</Button>
              </GuestFormDialog>
            )}
          </div>
        </div>
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
      </div>
      <DeleteConfirmationDialog
        isOpen={!!guestToDelete}
        onOpenChange={(isOpen) => !isOpen && setGuestToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={guestToDelete ? `${guestToDelete.firstName} ${guestToDelete.lastName}` : "the guest"}
      />
    </>
  )
}
