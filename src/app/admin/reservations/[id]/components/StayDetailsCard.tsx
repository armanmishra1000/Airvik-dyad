"use client";

import { format, parseISO } from "date-fns";
import { BedDouble, CalendarDays, Moon, Users, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import { useDataContext } from "@/context/data-context";

interface StayDetailsCardProps {
  reservation: ReservationWithDetails;
}

export function StayDetailsCard({ reservation }: StayDetailsCardProps) {
  const { roomTypes, ratePlans, rooms } = useDataContext();
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
          Information about the guest&apos;s stay.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-3 text-base">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">
            {format(parseISO(reservation.checkInDate), "MMM d, yyyy")}
          </span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="font-semibold">
            {format(parseISO(reservation.checkOutDate), "MMM d, yyyy")}
          </span>
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.nights} nights</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {reservation.numberOfGuests} guests ({reservation.adultCount} adults · {reservation.childCount} children)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>
              {reservation.roomNumber} ({roomType?.name})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>{ratePlan?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.paymentMethod || "Payment on file"}</span>
          </div>
        </div>
        {reservation.notes?.trim() && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 font-serif text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Guest Notes
              </h4>
              <p className="whitespace-pre-wrap text-muted-foreground">{reservation.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
