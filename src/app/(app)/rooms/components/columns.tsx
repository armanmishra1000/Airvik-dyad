"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RoomType } from "@/data"

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
    id: "actions",
    cell: ({ row }) => {
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]