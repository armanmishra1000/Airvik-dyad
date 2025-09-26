"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Guest } from "@/data/types"
import { GuestFormDialog } from "./guest-form-dialog"
import { useAuthContext } from "@/context/auth-context"

export const columns: ColumnDef<Guest>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const guest = row.original
      return (
        <Link
          href={`/guests/${guest.id}`}
          className="font-medium text-primary hover:underline"
        >
          {guest.firstName} {guest.lastName}
        </Link>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const guest = row.original
      const { hasPermission } = useAuthContext();
 
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
            {hasPermission("update:guest") && (
                <GuestFormDialog guest={guest}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                </GuestFormDialog>
            )}
            {hasPermission("delete:guest") && (
                <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={() => table.options.meta?.openDeleteDialog?.(guest)}
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