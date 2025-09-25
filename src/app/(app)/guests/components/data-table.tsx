"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
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
import { DataTablePagination } from "@/app/(app)/reservations/components/data-table-pagination"
import { GuestFormDialog } from "./guest-form-dialog"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"
import { useAppContext } from "@/context/app-context"
import type { Guest } from "@/data"

export function GuestsDataTable<TData extends Guest, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [guestToDelete, setGuestToDelete] = React.useState<TData | null>(null)
  const { deleteGuest, hasPermission } = useAppContext()

  const handleDeleteConfirm = () => {
    if (guestToDelete) {
      const success = deleteGuest(guestToDelete.id);
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: {
      openDeleteDialog: (guest: TData) => {
        setGuestToDelete(guest)
      },
    },
  })

  return (
    <>
      <div className="space-y-4">
          <div className="flex items-center justify-end">
              {hasPermission("create:guest") && (
                <GuestFormDialog>
                    <Button>Add Guest</Button>
                </GuestFormDialog>
              )}
          </div>
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