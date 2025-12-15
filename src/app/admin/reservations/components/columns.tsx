"use client"

import React from "react"
import { ColumnDef, Table, type CellContext } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2, XCircle, LogIn, LogOut, HelpCircle, AlertCircle, Monitor, User, ChevronDown, ChevronRight, Clock3, DownloadCloud } from "lucide-react"
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
import type {
  Reservation,
  ReservationSource,
  ReservationStatus,
} from "@/data/types"
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { formatBookingCode } from "@/lib/reservations/formatting";

export type ReservationWithDetails = Reservation & {
  displayAmount?: number;
  guestName: string;
  roomNumber: string;
  nights: number;
  roomCount?: number;
  subRows?: ReservationWithDetails[];
};

export const statuses = [
    { value: "Tentative", label: "Tentative", icon: HelpCircle },
    { value: "Standby", label: "Standby", icon: Clock3 },
    { value: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
    { value: "Checked-in", label: "Checked-in", icon: LogIn },
    { value: "Checked-out", label: "Checked-out", icon: LogOut },
    { value: "Cancelled", label: "Cancelled", icon: XCircle },
    { value: "No-show", label: "No-show", icon: AlertCircle },
  ]

function ReservationActions({ reservation, table }: { reservation: ReservationWithDetails; table: Table<ReservationWithDetails> }) {
  const router = useRouter();
  const status = reservation.status;

  const canBeCancelled = ["Cancelled", "Checked-out", "No-show"].includes(status) === false;
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
        <DropdownMenuItem onSelect={() => router.push(`/admin/reservations/${detailsId}`)}>
            View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(formatBookingCode(reservation.bookingId))}
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

function AmountCell({ row }: CellContext<ReservationWithDetails, unknown>) {
  const formatCurrency = useCurrencyFormatter();
  const rawValue = row.getValue("totalAmount");
  const normalizedTotal =
    typeof rawValue === "number"
      ? rawValue
      : Number.parseFloat(String(rawValue ?? "")) || 0;
  const amount =
    typeof row.original.displayAmount === "number"
      ? row.original.displayAmount
      : normalizedTotal;
  return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
}

export const columns: ColumnDef<ReservationWithDetails>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      if (row.getCanExpand()) {
        return (
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              className: "p-1 rounded-full hover:bg-muted",
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        );
      }

      return (
        <span className="text-xs font-medium text-muted-foreground">
          {row.index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "id",
    header: "Booking ID",
    filterFn: (row, id, value) => {
        const input = String(value ?? "").trim().toLowerCase();
        if (!input) return true;
        const rawValue = String(row.getValue(id) ?? "");
        const bookingIdentifier = row.original.bookingId || row.original.id || rawValue;
        const normalized = bookingIdentifier
          .replace(/^booking-/i, "")
          .replace(/^vik-/i, "")
          .toLowerCase();
        const formatted = formatBookingCode(bookingIdentifier).toLowerCase();
        const rawLower = bookingIdentifier.toLowerCase();
        return (
          normalized.includes(input) ||
          rawLower.includes(input) ||
          formatted.includes(input)
        );
    },
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

        const formattedCode = formatBookingCode(displayId);

        return (
            <Link href={`/admin/reservations/${linkId}`} className="font-mono text-xs text-primary hover:underline">
                {formattedCode}
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
    filterFn: (row, id, value) => {
        const input = String(value ?? "").trim().toLowerCase();
        if (!input) return true;
        const guestName = String(row.getValue(id) ?? "").toLowerCase();
        return guestName.includes(input);
    },
    cell: ({ row, getValue }) => {
        if (row.depth > 0) return null;
        return getValue();
    }
  },
  {
    accessorKey: "roomNumber",
    header: "Room",
    cell: ({ row, getValue }) => {
        const original = row.original;
        if (row.depth > 0) {
          return (
            <div style={{ paddingLeft: `${row.depth * 1}rem` }}>
              Room {getValue() as string}
            </div>
          );
        }

        const roomCount = original.roomCount ?? original.subRows?.length ?? 1;
        const childRooms = original.subRows?.map((sub) => sub.roomNumber).filter(Boolean) ?? [];
        return (
          <div className="space-y-1">
            <span className="font-medium">
              {roomCount === 1 ? "1 Room" : `${roomCount} Rooms`}
            </span>
            {roomCount === 1 && original.roomNumber && original.roomNumber !== "N/A" && (
              <span className="block text-xs text-muted-foreground">
                Room {original.roomNumber}
              </span>
            )}
            {roomCount > 1 && childRooms.length > 0 && (
              <span className="block text-xs text-muted-foreground">
                {childRooms.join(", ")}
              </span>
            )}
          </div>
        );
    }
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
    cell: AmountCell,
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
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => {
      if (row.depth > 0) return null;
      const method = row.getValue("paymentMethod") as string | undefined;
      return <span className="text-sm text-muted-foreground">{method || "-"}</span>;
    }
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
        if (row.depth > 0) return null;
        const source = row.getValue("source") as ReservationSource;
        const iconMap: Record<
          ReservationSource,
          React.ComponentType<React.SVGProps<SVGSVGElement>>
        > = {
          website: Monitor,
          reception: User,
          vikbooking: DownloadCloud,
        };
        const Icon = iconMap[source] ?? User;
        const label =
          source === "vikbooking"
            ? "Imported from VikBooking"
            : source === "website"
            ? "Website"
            : "Reception";

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
