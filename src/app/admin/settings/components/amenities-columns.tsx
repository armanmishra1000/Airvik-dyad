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
import type { Amenity } from "@/data/types"
import { AmenityFormDialog } from "./amenity-form-dialog"
import { Icon } from "@/components/shared/icon"

export const columns: ColumnDef<Amenity>[] = [
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
        const iconName = row.getValue("icon") as string;
        return <Icon name={iconName} className="h-5 w-5" />
    }
  },
  {
    accessorKey: "name",
    header: "Amenity Name",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const amenity = row.original
      interface AmenitiesTableMeta {
        hasPermission?: (permission: string) => boolean;
        openDeleteDialog?: (amenity: Amenity) => void;
      }

      const meta = table.options.meta as AmenitiesTableMeta | undefined;
      const hasPermission = meta?.hasPermission;
 
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
            {hasPermission?.("update:setting") && (
              <AmenityFormDialog amenity={amenity}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </AmenityFormDialog>
            )}
            {hasPermission?.("update:setting") && (
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => meta?.openDeleteDialog?.(amenity)}
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
