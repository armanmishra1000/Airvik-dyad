"use client";

import { ArrowLeft, LogIn, LogOut, XCircle, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDataContext } from "@/context/data-context";
import type { ReservationWithDetails } from "@/app/(app)/reservations/components/columns";
import { CancelReservationDialog } from "@/app/(app)/reservations/components/cancel-reservation-dialog";
import { EditReservationDialog } from "@/app/(app)/reservations/components/edit-reservation-dialog";
import * as React from "react";

interface ReservationHeaderProps {
  reservation: ReservationWithDetails;
}

/**
 * Renders the header for a reservation detail view with status badge and action controls.
 *
 * The header displays the reservation status, navigation, and action buttons for editing,
 * checking in, checking out, and cancelling. Triggering a status change calls
 * `updateReservationStatus`, shows a toast notification ("Reservation status updated to {status}."),
 * and, when cancelling, closes the cancel dialog.
 *
 * @param reservation - Reservation data (must include `id` and `status`) used to drive UI state and actions
 * @returns The rendered reservation header JSX element
 */
export function ReservationHeader({ reservation }: ReservationHeaderProps) {
  const { updateReservationStatus } = useDataContext();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  const handleStatusUpdate = (status: "Checked-in" | "Checked-out" | "Cancelled") => {
    updateReservationStatus(reservation.id, status);
    toast.success(`Reservation status updated to ${status}.`);
    if (status === "Cancelled") {
      setIsCancelDialogOpen(false);
    }
  };

  const canBeModified = !["Checked-in", "Checked-out", "Cancelled", "No-show"].includes(
    reservation.status
  );
  const canBeCancelled = !["Cancelled", "Checked-out", "No-show"].includes(
    reservation.status
  );
  const canBeCheckedIn = reservation.status === "Confirmed";
  const canBeCheckedOut = reservation.status === "Checked-in";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 bg-card/80 px-4 py-3 shadow-sm">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/50" asChild>
          <Link href="/reservations">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 text-base font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
          Reservation Details
        </h1>
        <Badge variant="outline" className="ml-auto rounded-full px-3 py-1 text-xs font-medium sm:ml-0">
          {reservation.status}
        </Badge>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <EditReservationDialog reservation={reservation}>
            <Button variant="outline" size="sm" disabled={!canBeModified}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </EditReservationDialog>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate("Checked-in")}
            disabled={!canBeCheckedIn}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Check-in
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate("Checked-out")}
            disabled={!canBeCheckedOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Check-out
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
            disabled={!canBeCancelled}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
      <CancelReservationDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={() => handleStatusUpdate("Cancelled")}
      />
    </>
  );
}