"use client";

import {
  ArrowLeft,
  CheckCircle2,
  LogIn,
  LogOut,
  XCircle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-context";
import type { ReservationWithDetails } from "@/app/(app)/reservations/components/columns";
import { CancelReservationDialog } from "@/app/(app)/reservations/components/cancel-reservation-dialog";
import { EditReservationDialog } from "@/app/(app)/reservations/components/edit-reservation-dialog";
import * as React from "react";

interface ReservationHeaderProps {
  reservation: ReservationWithDetails;
}

export function ReservationHeader({ reservation }: ReservationHeaderProps) {
  const { updateReservationStatus } = useAppContext();
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
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/reservations">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Reservation Details
        </h1>
        <Badge variant="outline" className="ml-auto sm:ml-0">
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