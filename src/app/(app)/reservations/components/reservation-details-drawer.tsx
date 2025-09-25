"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockGuests, mockRooms, mockRoomTypes, mockRatePlans } from "@/data";
import type { ReservationWithDetails } from "./columns";
import { format, differenceInDays } from "date-fns";

interface ReservationDetailsDrawerProps {
  reservation: ReservationWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelReservation: (reservationId: string) => void;
  onCheckInReservation: (reservationId: string) => void;
}

export function ReservationDetailsDrawer({
  reservation,
  isOpen,
  onClose,
  onCancelReservation,
  onCheckInReservation,
}: ReservationDetailsDrawerProps) {
  if (!reservation) return null;

  const guest = mockGuests.find((g) => g.id === reservation.guestId);
  const room = mockRooms.find((r) => r.id === reservation.roomId);
  const roomType = mockRoomTypes.find((rt) => rt.id === room?.roomTypeId);
  const ratePlan = mockRatePlans.find((rp) => rp.id === reservation.ratePlanId);
  const nights = differenceInDays(
    new Date(reservation.checkOutDate),
    new Date(reservation.checkInDate)
  );

  const handleCancel = () => {
    onCancelReservation(reservation.id);
    onClose();
  };

  const handleCheckIn = () => {
    onCheckInReservation(reservation.id);
    onClose();
  };

  const canBeCancelled = ![
    "Cancelled",
    "Checked-out",
    "No-show",
  ].includes(reservation.status);

  const canBeCheckedIn = reservation.status === "Confirmed";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle>Reservation Details</DrawerTitle>
            <DrawerDescription>
              ID: {reservation.id}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Guest Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Guest Information</h3>
                <p className="text-sm">
                  <strong>Name:</strong> {guest?.firstName} {guest?.lastName}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {guest?.email}
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> {guest?.phone}
                </p>
              </div>

              {/* Stay Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Stay Details</h3>
                <p className="text-sm">
                  <strong>Check-in:</strong>{" "}
                  {format(new Date(reservation.checkInDate), "MMM d, yyyy")}
                </p>
                <p className="text-sm">
                  <strong>Check-out:</strong>{" "}
                  {format(new Date(reservation.checkOutDate), "MMM d, yyyy")}
                </p>
                <p className="text-sm">
                  <strong>Nights:</strong> {nights}
                </p>
                <p className="text-sm">
                  <strong>Guests:</strong> {reservation.numberOfGuests}
                </p>
              </div>

              {/* Room & Rate */}
              <div className="space-y-4">
                <h3 className="font-semibold">Room & Rate</h3>
                <p className="text-sm">
                  <strong>Room:</strong> {room?.roomNumber} ({roomType?.name})
                </p>
                <p className="text-sm">
                  <strong>Rate Plan:</strong> {ratePlan?.name}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong> <Badge>{reservation.status}</Badge>
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Folio */}
            <div>
              <h3 className="font-semibold mb-4">Folio / Charges</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservation.folio.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(reservation.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleCheckIn} disabled={!canBeCheckedIn}>
              Check-in
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!canBeCancelled}
            >
              Cancel Reservation
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}