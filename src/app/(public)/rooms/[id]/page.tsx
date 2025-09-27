import { notFound } from "next/navigation";
import {
  getRoomTypeWithAmenities,
  getAmenities,
  getRooms,
  getReservations,
  getRatePlans,
} from "@/lib/api";
import { RoomDetailsClientPage } from "./components/RoomDetailsClientPage";

interface PageProps {
  params: any; // Using 'any' to bypass Next.js type generation bug
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RoomDetailsPage({
  params,
  searchParams,
}: PageProps) {
  // Fetch all necessary data in parallel on the server
  const [
    roomTypeResult,
    amenitiesResult,
    roomsResult,
    reservationsResult,
    ratePlansResult,
  ] = await Promise.all([
    getRoomTypeWithAmenities(params.id),
    getAmenities(),
    getRooms(),
    getReservations(),
    getRatePlans(),
  ]);

  const { data: roomType, error: roomTypeError } = roomTypeResult;
  const { data: allAmenities, error: amenitiesError } = amenitiesResult;
  const { data: rooms, error: roomsError } = roomsResult;
  const { data: reservations, error: reservationsError } = reservationsResult;
  const { data: ratePlans, error: ratePlansError } = ratePlansResult;

  // Log any errors that occurred during fetching
  if (roomTypeError || amenitiesError || roomsError || reservationsError || ratePlansError) {
    console.error("Error fetching data for room details page:", {
      roomTypeError,
      amenitiesError,
      roomsError,
      reservationsError,
      ratePlansError,
    });
  }

  // If the specific room type wasn't found, render a 404 page
  if (!roomType) {
    notFound();
  }

  return (
    <RoomDetailsClientPage
      roomType={roomType}
      allAmenities={allAmenities || []}
      rooms={rooms || []}
      reservations={reservations || []}
      ratePlans={ratePlans || []}
      initialSearchParams={searchParams}
    />
  );
}