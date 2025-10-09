"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Bed, Check } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RoomType } from "@/data/types";
import { Icon } from "@/components/shared/icon";
import { useDataContext } from "@/context/data-context";

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
  const detailsLink = `/book/rooms/${roomType.id}`;
  const { amenities: allAmenities } = useDataContext();

  const resolvedAmenities = (roomType.amenities || [])
    .map((id) => allAmenities.find((a) => a.id === id))
    .filter((a): a is { id: string; name: string; icon: string } => !!a);

  // Card view
  return (
    <Card className="flex flex-col bg-card border-border/50 hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={
              roomType.mainPhotoUrl ||
              roomType.photos[0] ||
              "/room-placeholder.svg"
            }
            alt={roomType.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {hasSearched && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-green-500/90 text-white border-none">
                <Check className="h-3.5 w-3.5 mr-1" />
                Available
              </Badge>
            </div>
          )}

        </div>
      </CardHeader>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-foreground font-serif text-xl">{roomType.name}</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">₹3000</div>
            <div className="text-xs text-muted-foreground">per night</div>
          </div>
        </div>
        <CardDescription className="mt-2 text-muted-foreground line-clamp-2 overflow-hidden">
          {roomType.description}
        </CardDescription>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary/60" />
            <span>Up to {roomType.maxOccupancy} guests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-primary/60" />
            <span>{roomType.bedTypes.join(", ")}</span>
          </div>
        </div>
        {!hasSearched && resolvedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {resolvedAmenities.slice(0, 3).map((a) => (
              <Badge key={a.id} variant="outline" className="text-xs">
                <Icon name={a.icon} className="h-3.5 w-3.5 mr-1" />
                {a.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <CardFooter className="flex-col items-stretch gap-2 px-5 pb-5">
        {hasSearched ? (
          <Button onClick={() => onSelect(roomType)} disabled={isSelectionComplete} size="lg" className="w-full">
            Select Room
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href={detailsLink}>View Details & Book</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}