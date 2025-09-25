"use client"

import Image from "next/image"
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
import type { Room } from "@/data"
import { RoomFormDialog } from "./room-form-dialog"
import { useAppContext } from "@/context/app-context"

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
      openDeleteDialog: (item: TData) => void
    }
}

export const columns: ColumnDef<Room>[] = [
    {
        id: "image",
        header: "Image",
        cell: ({ row }) => {
          const room = row.original
          const { roomTypes } = useAppContext()
          const roomType = roomTypes.find(rt => rt.id === room.roomTypeId)
          
          const imageUrl = room.photos?.[0] || roomType?.mainPhotoUrl || roomType?.photos?.[0] || "/room-placeholder.svg"
          
          return (
            <div className="w-16 h-10 relative rounded-md overflow-hidden">
                <Image 
                    src={imageUrl}
                    alt={`Room ${room.roomNumber}`}
                    fill
                    className="object-cover"
                />
            </div>
          )
        },
      },
  {
    accessorKey: "roomNumber",
    header: "Room Number",
  },
  {
    accessorKey: "roomTypeId",
    header: "Room Type",
    cell: ({ row }) => {
        const { roomTypes } = useAppContext()
        const roomTypeId = row.getValue("roomTypeId") as string;
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        return <span>{roomType?.name || "Unknown"}</span>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant="outline">{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const room = row.original
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
            {hasPermission("update:room") && (
                <RoomFormDialog room={room}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                </RoomFormDialog>
            )}
            {hasPermission("delete:room") && (
                <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={() => table.options.meta?.openDeleteDialog(room)}
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