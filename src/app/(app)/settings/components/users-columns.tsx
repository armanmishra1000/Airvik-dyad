"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/data/types"
import { useDataContext } from "@/context/data-context"
import { useAuthContext } from "@/context/auth-context"
import { UserFormDialog } from "./user-form-dialog"

function UserRoleCell({ roleId }: { roleId: string }) {
  const { roles } = useDataContext()
  const role = roles.find((item) => item.id === roleId)

  return <span>{role?.name || "Unknown"}</span>
}

function UserActionsCell({
  user,
  onDelete,
}: {
  user: User
  onDelete?: (user: User) => void
}) {
  const { hasPermission } = useAuthContext()

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
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </UserFormDialog>
        )}
        {hasPermission("delete:user") && (
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => onDelete?.(user)}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
    cell: ({ row }) => (
      <UserRoleCell roleId={row.getValue("roleId") as string} />
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <UserActionsCell
        user={row.original}
        onDelete={table.options.meta?.openDeleteDialog}
      />
    ),
  },
]