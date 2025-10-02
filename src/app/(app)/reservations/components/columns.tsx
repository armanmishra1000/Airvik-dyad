"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, XCircle, LogIn, LogOut, HelpCircle, AlertCircle, Monitor, User, ChevronDown, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ReservationStatus } from "@/data/types"

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
    bookingDate: string;
    bookingId: string;
    source: 'reception' | 'website';
    nights: number;
    subRows?: ReservationWithDetails[];
}

export const statuses = [
    { value: "Tentative", label: "Tentative", icon: HelpCircle },
    { value: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
    { value: "Checked-in", label: "Checked-in", icon: LogIn },
    { value: "Checked-out", label: "Checked-out", icon: LogOut },
    { value: "Cancelled", label: "Cancelled", icon: XCircle },
    { value: "No-show", label: "No-show", icon: AlertCircle },
  ]

function ReservationActions({ reservation, table }: { reservation: ReservationWithDetails; table: any }) {
  const router = useRouter();
  const status = reservation.status;

  const canBeCancelled = !["Cancelled", "Checked-out", "No-show"].includes(status);
  const canBeCheckedIn = status === "Confirmed";
  const canBeCheckedOut = status === "Checked-in";
  const detailsId = reservation.subRows ? reservation.subRows[0].id : reservation.id;

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
        <DropdownMenuItem onSelect={() => router.push(`/reservations/${detailsId}`)}>
            View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(reservation.id)}
        >
          Copy booking ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => table.options.meta?.checkInReservation?.(reservation)}
          disabled={!canBeCheckedIn}
        >
          Check-in
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => table.options.meta?.checkOutReservation?.(reservation)}
          disabled={!canBeCheckedOut}
        >
          Check-out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => table.options.meta?.openCancelDialog?.(reservation)}
          disabled={!canBeCancelled}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          Cancel Reservation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<ReservationWithDetails>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            className: "p-1 rounded-full hover:bg-muted",
          }}
        >
          {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      ) : <div className="w-8"></div> // Placeholder for alignment
    },
  },
  {
    accessorKey: "id",
    header: "Booking ID",
    cell: ({ row }) => {
        if (row.depth > 0) {
            return null;
        }
        const reservation = row.original;
        const isGroup = !!reservation.subRows;
        
        const displayId = isGroup ? reservation.id : reservation.bookingId;
        const linkId = isGroup ? reservation.subRows![0].id : reservation.id;

        if (!displayId) {
            return <span className="font-mono text-xs">N/A</span>;
        }

        return (
            <Link href={`/reservations/${linkId}`} className="font-mono text-xs text-primary hover:underline">
                {displayId.substring(displayId.startsWith('booking-') ? 8 : 4)}
            </Link>
        )
    }
  },
  {
    accessorKey: "bookingDate",
    header: "Booking Date",
    cell: ({ row }) => {
        if (row.depth > 0) return null;
        const dateValue = row.getValue("bookingDate") as string;
        if (!dateValue) return null;
        return format(new Date(dateValue), "MMM d, yyyy");
    }
  },
  {
    accessorKey: "guestName",
    header: "Customer Name",
    cell: ({ row, getValue }) => {
        if (row.depth > 0) return null;
        return getValue();
    }
  },
  {
    accessorKey: "roomNumber",
    header: "Room",
    cell: ({ row, getValue }) => (
        <div style={{ paddingLeft: `${row.depth * 1}rem` }}>
            {getValue() as string}
        </div>
    )
  },
  {
    accessorKey: "numberOfGuests",
    header: "Guests",
    cell: ({ row, getValue }) => {
        if (row.depth > 0) return null;
        return getValue();
    }
  },
  {
    accessorKey: "checkInDate",
    header: "Check-in",
    cell: ({ row }) => {
        if (row.depth > 0) return null;
        const dateValue = row.getValue("checkInDate") as string;
        if (!dateValue) return null;
        return format(new Date(dateValue), "MMM d, yyyy");
    }
  },
  {
    accessorKey: "checkOutDate",
    header: "Check-out",
    cell: ({ row }) => {
        if (row.depth > 0) return null;
        const dateValue = row.getValue("checkOutDate") as string;
        if (!dateValue) return null;
        return format(new Date(dateValue), "MMM d, yyyy");
    }
  },
  {
    accessorKey: "nights",
    header: "Nights",
    cell: ({ row, getValue }) => {
        if (row.depth > 0) return null;
        return getValue();
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
    accessorKey: "status",
    header: "Status",
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
    cell: ({ row }) => {
        const status = statuses.find(s => s.value === row.getValue("status"))
        if (!status) return null;
        if (row.depth > 0) return null;

        const variant: "default" | "secondary" | "destructive" | "outline" = 
            status.value === "Checked-in" ? "default" :
            status.value === "Confirmed" ? "secondary" :
            status.value === "Cancelled" ? "destructive" : "outline";
        return <Badge variant={variant}>{status.label}</Badge>
    }
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
        if (row.depth > 0) return null;
        const source = row.getValue("source") as string;
        const Icon = source === 'website' ? Monitor : User;
        const label = source ? source.charAt(0).toUpperCase() + source.slice(1) : "Unknown";

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Icon className="h-5 w-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      if (row.depth > 0) return null;
      return <ReservationActions reservation={row.original} table={table} />;
    },
  },
]