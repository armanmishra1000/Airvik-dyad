"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useDataContext } from "@/context/data-context";
import type { Reservation } from "@/data/types";

interface LinkedReservationsCardProps {
  reservation: Reservation;
}

export function LinkedReservationsCard({ reservation }: LinkedReservationsCardProps) {
  const { reservations: allReservations, rooms, roomTypes } = useDataContext();

  const linkedReservations = allReservations.filter(
    (r) => r.bookingId === reservation.bookingId && r.id !== reservation.id
  );

  if (linkedReservations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Booking</CardTitle>
        <CardDescription>
          This reservation is part of a group booking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {linkedReservations.map((res) => {
              const room = rooms.find((r) => r.id === res.roomId);
              const roomType = roomTypes.find(rt => rt.id === room?.roomTypeId);
              return (
                <TableRow key={res.id}>
                  <TableCell>
                    <Link href={`/reservations/${res.id}`} className="font-medium text-primary hover:underline">
                      Room {room?.roomNumber}
                    </Link>
                    <div className="text-sm text-muted-foreground">{roomType?.name}</div>
                  </TableCell>
                  <TableCell className="text-right">{res.status}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}