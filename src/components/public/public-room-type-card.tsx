import Link from "next/link";
import { Users, Bed, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RoomType } from "@/data/types";

interface PublicRoomTypeCardProps {
  roomType: RoomType;
  checkIn?: Date | undefined;
  checkOut?: Date | undefined;
  guests?: number;
}

export function PublicRoomTypeCard({
  roomType,
  checkIn,
  checkOut,
  guests = 2,
}: PublicRoomTypeCardProps) {
  const detailsLink = `/rooms/${roomType.id}`;
  const bookingLink = checkIn && checkOut
    ? `/book/review?roomTypeId=${roomType.id}&checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&guests=${guests}`
    : `/rooms/${roomType.id}`;

  // Calculate number of nights for price display
  const nights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <img
            src={
              roomType.mainPhotoUrl ||
              roomType.photos[0] ||
              "/room-placeholder.svg"
            }
            alt={roomType.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {roomType.baseRate && (
            <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
              ${roomType.baseRate}/night
            </div>
          )}
        </div>
      </CardHeader>

      <div className="flex flex-col flex-1 p-6">
        <CardTitle className="text-xl mb-2">{roomType.name}</CardTitle>
        <CardDescription className="text-muted-foreground mb-4 flex-1">
          {roomType.description}
        </CardDescription>

        <div className="space-y-3">
          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Up to {roomType.maxOccupancy} guests
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {roomType.bedTypes.join(", ")}
            </Badge>
            {roomType.size && (
              <Badge variant="secondary">
                {roomType.size} sq ft
              </Badge>
            )}
          </div>

          {/* Price */}
          {roomType.baseRate && (
            <div className="text-lg font-semibold text-primary">
              ${roomType.baseRate} × {nights} night{nights > 1 ? 's' : ''}
              {nights > 1 && (
                <div className="text-sm font-normal text-muted-foreground">
                  Total: ${roomType.baseRate * nights}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CardFooter className="flex-col gap-3 p-6 pt-0">
        <Button asChild className="w-full" size="lg">
          <Link href={bookingLink}>
            {checkIn && checkOut ? 'Book Now' : 'View Details & Book'}
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link href={detailsLink}>View Room Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}