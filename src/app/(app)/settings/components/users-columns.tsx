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
import type { User } from "@/data"
import { useAppContext } from "@/context/app-context"
import { UserFormDialog } from "./user-form-dialog"

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      openDeleteDialog: (item: TData) => void
    }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roleId",
    header: "Role",
    cell: ({ row }) => {
        const { roles } = useAppContext();
        const roleId = row.getValue("roleId") as string;
        const role = roles.find(r => r.id === roleId);
        return <span>{role?.name || "Unknown"}</span>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original
      const { hasPermission } = useAppContext();
 
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
            {hasPermission("update:user") && (
                <UserFormDialog user={user}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                </UserFormDialog>
            )}
            {hasPermission("delete:user") && (
                <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={() => table.options.meta?.openDeleteDialog(user)}
                >
                    Delete
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]