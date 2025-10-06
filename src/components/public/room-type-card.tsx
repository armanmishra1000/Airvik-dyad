import Link from "next/link";
import { Users, Bed } from "lucide-react";
import {
  Card,
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

/**
 * Render a card summarizing a room type with actions to view details or select it.
 *
 * @param roomType - Room type data used to populate image, title, description, occupancy, and bed types
 * @param onSelect - Callback invoked with `roomType` when the "Select Room" button is pressed
 * @param isSelectionComplete - When `true`, disables the "Select Room" button to prevent further selection
 * @param hasSearched - When `true`, shows a "Select Room" action; otherwise shows a "View Details & Book" link
 * @returns A React element containing the room type card UI
 */
export function RoomTypeCard({
  roomType,
  onSelect,
  isSelectionComplete,
  hasSearched,
}: RoomTypeCardProps) {
  const detailsLink = `/book/rooms/${roomType.id}`;

  return (
    <Card className="flex flex-col bg-card border-border/50">
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
      <div className="flex flex-col flex-1 p-4">
        <CardTitle className="text-foreground font-serif">{roomType.name}</CardTitle>
        <CardDescription className="mt-2 flex-1 text-muted-foreground">
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
          <Button asChild className="h-12 rounded-lg">
            <Link href={detailsLink}>View Details & Book</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}