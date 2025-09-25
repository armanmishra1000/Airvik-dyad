"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/data"
import { RoleFormDialog } from "./role-form-dialog"

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      openDeleteDialog: (item: TData) => void
    }
}

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Role Name",
  },
  {
    id: "permissionsCount",
    header: "Permissions",
    cell: ({ row }) => {
        const role = row.original;
        return <span>{role.permissions.length} permissions</span>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const role = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <RoleFormDialog role={role}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit
                </DropdownMenuItem>
            </RoleFormDialog>
            <DropdownMenuItem 
                className="text-destructive"
                onSelect={() => table.options.meta?.openDeleteDialog(role)}
            >
                Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]