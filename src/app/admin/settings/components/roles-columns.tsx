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
import type { Role } from "@/data/types"
import { RoleFormDialog } from "./role-form-dialog"
import { canManageRole } from "@/lib/roles"
import type { RolesTableMeta } from "./roles-data-table"

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
        return <span>{role.permissions?.length || 0} permissions</span>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const role = row.original
      const meta = table.options.meta as RolesTableMeta | undefined
      const actorRole = meta?.actorRole ?? null
      const allowManageRoles = meta?.allowManageRoles ?? false
      const canManage = allowManageRoles && canManageRole(actorRole, role)
 
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
            <RoleFormDialog role={role} actorRole={actorRole} allowManageRoles={allowManageRoles}>
              <DropdownMenuItem
                disabled={!canManage}
                onSelect={(e) => {
                  e.preventDefault()
                  if (!canManage) {
                    return
                  }
                }}
              >
                Edit
              </DropdownMenuItem>
            </RoleFormDialog>
            <DropdownMenuItem 
                className="text-destructive"
                disabled={!canManage}
                onSelect={(e) => {
                  if (!canManage) {
                    e.preventDefault()
                    return
                  }
                  meta?.openDeleteDialog?.(role)
                }}
            >
                Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
