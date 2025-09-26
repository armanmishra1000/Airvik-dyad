"use client";

import { format, parseISO } from "date-fns";
import { BedDouble, CalendarDays, Moon, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ReservationWithDetails } from "@/app/(app)/reservations/components/columns";
import { useAppContext } from "@/context/app-context";

interface StayDetailsCardProps {
  reservation: ReservationWithDetails;
}

export function StayDetailsCard({ reservation }: StayDetailsCardProps) {
  const { roomTypes, ratePlans, rooms } = useAppContext();
  const roomType = roomTypes.find(
    (rt) =>
      rt.id ===
      rooms.find((r) => r.id === reservation.roomId)?.roomTypeId
  );
  const ratePlan = ratePlans.find((rp) => rp.id === reservation.ratePlanId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stay Details</CardTitle>
        <CardDescription>
          Information about the guest's stay.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {format(parseISO(reservation.checkInDate), "MMM d, yyyy")}
          </span>
          <span className="mx-2 text-muted-foreground">&rarr;</span>
          <span className="font-medium">
            {format(parseISO(reservation.checkOutDate), "MMM d, yyyy")}
          </span>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{reservation.nights} nights</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{reservation.numberOfGuests} guests</span>
          </div>
          <div className="flex items-center">
            <BedDouble className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {reservation.roomNumber} ({roomType?.name})
            </span>
          </div>
          <div className="flex items-center">
            <BedDouble className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{ratePlan?.name}</span>
          </div>
        </div>
        {reservation.notes && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-1">Notes</h4>
              <p className="text-muted-foreground">{reservation.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}