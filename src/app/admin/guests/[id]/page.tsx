
"use client";

import { useParams, notFound } from "next/navigation";
import { useDataContext } from "@/context/data-context";
import { AppSkeleton } from "@/components/layout/app-skeleton";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GuestDetailsPage() {
  const params = useParams<{ id: string }>();
  const { isLoading, guests, reservations, rooms } = useDataContext();

  if (isLoading) {
    return <AppSkeleton />;
  }
  const list = guests ?? [];
  const guest = list.find((g) => g.id === params.id);

  if (!guest) {
    notFound();
  }

  const guestReservations = (reservations ?? [])
    .filter((res) => res.guestId === guest.id)
    .map(res => {
        const roomsList = rooms ?? [];
        const room = roomsList.find(r => r.id === res.roomId);
        return {
            ...res,
            roomNumber: room?.roomNumber || "N/A"
        };
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{guest.firstName} {guest.lastName}</CardTitle>
          <CardDescription>Guest Profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>{guest.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>{guest.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reservation History</CardTitle>
          <CardDescription>
            A list of all reservations associated with this guest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guestReservations.map(res => (
                  <TableRow key={res.id}>
                    <TableCell className="font-mono text-xs">{res.bookingId}</TableCell>
                    <TableCell>Room {res.roomNumber}</TableCell>
                    <TableCell>{res.status}</TableCell>
                  </TableRow>
                ))}
                {guestReservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
