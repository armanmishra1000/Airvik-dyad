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
import { DataTablePagination } from "@/app/admin/reservations/components/data-table-pagination"
import { RoleFormDialog } from "./role-form-dialog"
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog"
import { useDataContext } from "@/context/data-context"
import type { Role } from "@/data/types"
import { useAuth } from "@/hooks/use-auth"
import { canManageRole } from "@/lib/roles"

export type RolesTableMeta = {
  openDeleteDialog: (item: Role) => void;
  actorRole: Role | null;
  allowManageRoles: boolean;
  canManageRole: (role: Role | null | undefined) => boolean;
};

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
  const { userRole, hasPermission } = useAuth()

  const allowManageRoles = hasPermission("update:setting")
  const canManage = React.useCallback((role: Role | null | undefined) => canManageRole(userRole, role ?? null), [userRole])

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      if (!allowManageRoles || !canManage(itemToDelete)) {
        toast.error("You can only manage lower-level roles.")
        setItemToDelete(null)
        return
      }
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
        actorRole: userRole,
        allowManageRoles,
        canManageRole: canManage,
      } as unknown as RolesTableMeta,
  })

  const canCreate = allowManageRoles && !!userRole

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-3">
          {canCreate ? (
            <RoleFormDialog actorRole={userRole} allowManageRoles={allowManageRoles}>
              <Button>Add Role</Button>
            </RoleFormDialog>
          ) : null}
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
