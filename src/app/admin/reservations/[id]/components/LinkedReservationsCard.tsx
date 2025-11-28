"use client";

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
import { Badge } from "@/components/ui/badge";
import { useDataContext } from "@/context/data-context";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import { cn } from "@/lib/utils";

interface LinkedReservationsCardProps {
  reservations: ReservationWithDetails[];
  activeReservationId: string;
}

export function LinkedReservationsCard({ reservations, activeReservationId }: LinkedReservationsCardProps) {
  const { rooms, roomTypes } = useDataContext();

  if (reservations.length === 0) {
    return null;
  }

  const sortedReservations = [...reservations].sort((a, b) => {
    if (a.id === activeReservationId) return -1;
    if (b.id === activeReservationId) return 1;
    const roomA = a.roomNumber || "";
    const roomB = b.roomNumber || "";
    return roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: "base" });
  });

  const description =
    reservations.length === 1
      ? "This booking currently includes 1 room."
      : `This booking currently includes ${reservations.length} rooms.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg font-semibold">
          Group Booking
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-border/40">
          <Table>
          <TableBody>
            {sortedReservations.map((res) => {
              const room = rooms.find((r) => r.id === res.roomId);
              const roomType = roomTypes.find(rt => rt.id === room?.roomTypeId);
              const isActive = res.id === activeReservationId;
              const roomLabel = room?.roomNumber || res.roomNumber || "N/A";
              return (
                <TableRow
                  key={res.id}
                  className={cn(isActive && "bg-primary/5")}
                >
                  <TableCell className="space-y-1">
                    <p className="font-medium">
                      {(roomType?.name || "Room type")} · Room {roomLabel}
                    </p>
                  </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {res.status}
                      </Badge>
                    </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
