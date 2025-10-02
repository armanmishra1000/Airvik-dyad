"use client";

import { useParams, notFound } from "next/navigation";
import { useDataContext } from "@/context/data-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { columns } from "./components/columns";
import { ReservationsHistoryTable } from "./components/reservations-history-table";

/**
 * Render the guest details page that shows a guest's profile and their reservation history based on the route `id`.
 *
 * @returns The page JSX element displaying the guest's profile and a reservations table; triggers a 404 page if no guest matches the route `id`.
 */
export default function GuestDetailsPage() {
  const params = useParams<{ id: string }>();
  const { guests, reservations, rooms } = useDataContext();

  const guest = guests.find((g) => g.id === params.id);

  if (!guest) {
    notFound();
  }

  const guestReservations = reservations
    .filter((res) => res.guestId === guest.id)
    .map(res => {
        const room = rooms.find(r => r.id === res.roomId);
        return {
            ...res,
            roomNumber: room?.roomNumber || "N/A"
        }
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
          <ReservationsHistoryTable columns={columns} data={guestReservations} />
        </CardContent>
      </Card>
    </div>
  );
}