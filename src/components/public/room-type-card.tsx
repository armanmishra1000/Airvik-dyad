import Link from "next/link";
import { Users, Bed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RoomType } from "@/data/types";

interface RoomTypeCardProps {
  roomType: RoomType;
  onSelect: (roomType: RoomType) => void;
  isSelectionComplete: boolean;
  hasSearched: boolean;
}

export function RoomTypeCard({
  roomType,
  onSelect,
  isSelectionComplete,
  hasSearched,
}: RoomTypeCardProps) {
  const detailsLink = `/rooms/${roomType.id}`;

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <img
            src={
              roomType.mainPhotoUrl ||
              roomType.photos[0] ||
              "/room-placeholder.svg"
            }
            alt={roomType.name}
            className="absolute inset-0 h-full w-full object-cover rounded-t-lg"
          />
        </div>
      </CardHeader>
      <div className="flex flex-col flex-1 p-6">
        <CardTitle>{roomType.name}</CardTitle>
        <CardDescription className="mt-2 flex-1">
          {roomType.description}
        </CardDescription>
        <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Up to {roomType.maxOccupancy} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            <span>{roomType.bedTypes.join(", ")}</span>
          </div>
        </div>
      </div>
      <CardFooter className="flex-col items-stretch gap-2">
        {hasSearched ? (
          <Button onClick={() => onSelect(roomType)} disabled={isSelectionComplete}>
            Select Room
          </Button>
        ) : (
          <Button asChild className="h-10">
            <Link href={detailsLink}>View Details & Book</Link>
          </Button>
        )}
        <Button asChild variant="link" className="text-sm rounded-lg">
          <Link href={detailsLink}>View Room Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}