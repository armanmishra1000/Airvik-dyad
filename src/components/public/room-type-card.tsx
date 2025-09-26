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
import type { RoomType } from "@/data";

interface RoomTypeCardProps {
  roomType: RoomType;
  searchParams?: {
    from: string;
    to: string;
    guests: string;
    children: string;
    rooms: string;
  };
}

export function RoomTypeCard({ roomType, searchParams }: RoomTypeCardProps) {
  const href = `/rooms/${roomType.id}`;
  const query = searchParams ? new URLSearchParams(searchParams).toString() : "";
  const finalHref = query ? `${href}?${query}` : href;

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
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={finalHref}>View Details & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}