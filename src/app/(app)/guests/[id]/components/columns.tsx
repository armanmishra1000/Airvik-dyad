"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import type { Reservation } from "@/data/types"

// A simplified reservation type for this context
export type ReservationWithRoom = Reservation & { roomNumber: string }

export const columns: ColumnDef<ReservationWithRoom>[] = [
  {
    accessorKey: "roomNumber",
    header: "Room",
  },
  {
    accessorKey: "checkInDate",
    header: "Check-in",
    cell: ({ row }) => format(new Date(row.getValue("checkInDate")), "MMM d, yyyy"),
  },
  {
    accessorKey: "checkOutDate",
    header: "Check-out",
    cell: ({ row }) => format(new Date(row.getValue("checkOutDate")), "MMM d, yyyy"),
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
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]