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
import type { RoomCategory } from "@/data/types"
import { RoomCategoryFormDialog } from "./room-category-form-dialog"
import { useAuthContext } from "@/context/auth-context"

export const columns: ColumnDef<RoomCategory>[] = [
  {
    accessorKey: "name",
    header: "Category Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const category = row.original
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
            {hasPermission("update:room_category") && (
                <RoomCategoryFormDialog category={category}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                </RoomCategoryFormDialog>
            )}
            {hasPermission("delete:room_category") && (
                <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={() => table.options.meta?.openDeleteDialog?.(category)}
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