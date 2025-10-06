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
import { RoleFormDialog } from "./role-form-dialog"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"
import { useDataContext } from "@/context/data-context"
import type { Role } from "@/data/types"

/**
 * Render a roles table with sorting, pagination, an Add Role dialog, and per-row delete confirmation.
 *
 * Renders the provided columns and data using react-table, exposes UI for adding roles, paginates and sorts rows, and opens a confirmation dialog before deleting a role. Successful or failed deletions surface a toast notification.
 *
 * @param columns - Column definitions used to render table headers and cells
 * @param data - Array of role objects to display in the table
 * @returns A React element that displays the roles data table with controls for adding, sorting, paginating, and deleting roles
 */
export function RolesDataTable<TData extends Role, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [itemToDelete, setItemToDelete] = React.useState<TData | null>(null)
  const { deleteRole } = useDataContext()

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const success = await deleteRole(itemToDelete.id);
      if (success) {
        toast.success(`Role "${itemToDelete.name}" has been deleted.`);
      } else {
        toast.error("Failed to delete role.", {
          description: "This role is still assigned to one or more users.",
        });
      }
      setItemToDelete(null);
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
      openDeleteDialog: (item: TData) => {
        setItemToDelete(item)
      },
    },
  })

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-3">
          <RoleFormDialog>
            <Button>Add Role</Button>
          </RoleFormDialog>
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
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
      <DeleteConfirmationDialog
        isOpen={!!itemToDelete}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete ? itemToDelete.name : "the item"}
      />
    </>
  )
}