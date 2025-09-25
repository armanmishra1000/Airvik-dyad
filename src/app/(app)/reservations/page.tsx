import { mockReservations, mockGuests, mockRooms } from "@/data";
import { Reservation } from "@/data/types";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

// Combine data for easier lookup in the table
const reservationsWithDetails = mockReservations.map(res => {
    const guest = mockGuests.find(g => g.id === res.guestId);
    const room = mockRooms.find(r => r.id === res.roomId);
    return {
        ...res,
        guestName: guest ? `${guest.firstName} ${guest.lastName}` : 'N/A',
        roomNumber: room ? room.roomNumber : 'N/A',
    }
})

export default function ReservationsPage() {
  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={reservationsWithDetails} />
    </div>
  );
}