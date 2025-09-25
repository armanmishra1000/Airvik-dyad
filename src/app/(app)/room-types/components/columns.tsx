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
import { Badge } from "@/components/ui/badge"
import type { RoomType } from "@/data"
import { RoomTypeFormDialog } from "./room-type-form-dialog"

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      openDeleteDialog: (item: TData) => void
    }
}

export const columns: ColumnDef<RoomType>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "maxOccupancy",
    header: "Max Occupancy",
  },
  {
    accessorKey: "bedTypes",
    header: "Bed Types",
    cell: ({ row }) => {
        const bedTypes = row.getValue("bedTypes") as string[];
        return <span>{bedTypes.join(", ")}</span>
    }
  },
  {
    accessorKey: "amenities",
    header: "Amenities",
    cell: ({ row }) => {
        const amenities = row.getValue("amenities") as string[];
        if (!amenities || amenities.length === 0) {
            return <span className="text-muted-foreground">N/A</span>
        }
        return (
            <div className="flex flex-wrap gap-1">
                {amenities.map(amenity => (
                    <Badge key={amenity} variant="secondary">{amenity}</Badge>
                ))}
            </div>
        )
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const roomType = row.original
 
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
            <RoomTypeFormDialog roomType={roomType}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit
                </DropdownMenuItem>
            </RoomTypeFormDialog>
            <DropdownMenuItem 
                className="text-destructive"
                onSelect={() => table.options.meta?.openDeleteDialog(roomType)}
            >
                Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]