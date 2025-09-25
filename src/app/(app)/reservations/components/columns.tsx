"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReservationStatus } from "@/data"

export type ReservationWithDetails = {
    id: string;
    guestId: string;
    roomId: string;
    ratePlanId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    status: ReservationStatus;
    notes?: string | undefined;
    folio: any[];
    totalAmount: number;
    guestName: string;
    roomNumber: string;
}

export const columns: ColumnDef<ReservationWithDetails>[] = [
  {
    accessorKey: "guestName",
    header: "Guest",
  },
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
        const status = row.getValue("status") as ReservationStatus;
        const variant: "default" | "secondary" | "destructive" | "outline" = 
            status === "Checked-in" ? "default" :
            status === "Confirmed" ? "secondary" :
            status === "Cancelled" ? "destructive" : "outline";
        return <Badge variant={variant}>{status}</Badge>
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
  {
    id: "actions",
    cell: ({ row, table }) => {
      const reservation = row.original
      const canBeCancelled = ![
        "Cancelled",
        "Checked-out",
        "No-show",
      ].includes(reservation.status);
 
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(reservation.id)}
            >
              Copy reservation ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View guest details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => table.options.meta?.viewReservation(reservation)}>
                View reservation details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => table.options.meta?.openCancelDialog(reservation.id)}
              disabled={!canBeCancelled}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              Cancel Reservation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]