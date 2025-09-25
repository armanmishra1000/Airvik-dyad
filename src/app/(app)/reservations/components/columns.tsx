"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, XCircle, LogIn, LogOut, HelpCircle, AlertCircle } from "lucide-react"
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

export const statuses = [
    { value: "Tentative", label: "Tentative", icon: HelpCircle },
    { value: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
    { value: "Checked-in", label: "Checked-in", icon: LogIn },
    { value: "Checked-out", label: "Checked-out", icon: LogOut },
    { value: "Cancelled", label: "Cancelled", icon: XCircle },
    { value: "No-show", label: "No-show", icon: AlertCircle },
  ]

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
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
        const status = statuses.find(s => s.value === row.getValue("status"))
        if (!status) return null

        const variant: "default" | "secondary" | "destructive" | "outline" = 
            status.value === "Checked-in" ? "default" :
            status.value === "Confirmed" ? "secondary" :
            status.value === "Cancelled" ? "destructive" : "outline";
        return <Badge variant={variant}>{status.label}</Badge>
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
      const reservation = row.original;
      const status = reservation.status;
 
      const canBeCancelled = !["Cancelled", "Checked-out", "No-show"].includes(status);
      const canBeCheckedIn = status === "Confirmed";
      const canBeCheckedOut = status === "Checked-in";
 
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
            <DropdownMenuItem onClick={() => table.options.meta?.viewReservation(reservation)}>
                View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(reservation.id)}
            >
              Copy reservation ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => table.options.meta?.checkInReservation(reservation.id)}
              disabled={!canBeCheckedIn}
            >
              Check-in
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => table.options.meta?.checkOutReservation(reservation.id)}
              disabled={!canBeCheckedOut}
            >
              Check-out
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