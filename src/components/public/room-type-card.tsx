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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <Card className="flex flex-col border border-border/40 bg-transparent  duration-300 group overflow-hidden rounded-2xl shadow-lg">
      <CardHeader className="p-0">
        <Link href={detailsLink} className="block">
          <div className="relative h-48 md:h-52 overflow-hidden">
            <Image
              src={
                roomType.mainPhotoUrl ||
                roomType.photos[0] ||
                "/room-placeholder.svg"
              }
              alt={roomType.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* {hasSearched && (
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-green-500/90 text-white border-none">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Available
                </Badge>
              </div>
            )} */}

            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-[#ffffffcc] px-3 py-1 text-xs font-medium text-foreground shadow-md">
              <span className="font-serif">{roomType.bedTypes.join(", ")}</span>
            </div>

          </div>
        </Link>
      </CardHeader>
      <div className="flex flex-col flex-1 bg-white">
        <div className="flex flex-col flex-1 p-4 gap-2">
          <div className="flex items-strat justify-between gap-4">
            <CardTitle className="text-foreground font-serif text-base leading-tight line-clamp-2">
              <Link href={detailsLink} className="block leading-tight line-clamp-2 transition-colors">
                {roomType.name}
              </Link>
            </CardTitle>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">₹3000</div>
              <div className="text-xs text-muted-foreground">per night</div>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground truncate">
            {roomType.description}
          </CardDescription>
          {/* <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary/60" />
              <span>Up to {roomType.maxOccupancy} guests</span>
            </div>
          </div> */}
          {/* <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-primary/60" />
              <span>{roomType.bedTypes.join(", ")}</span>
            </div> */}

        </div>
        <CardFooter className="flex-col items-stretch gap-2 px-4 pb-4 pt-0 bg-white">
          {!hasSearched && resolvedAmenities.length > 0 && (
            <TooltipProvider delayDuration={0}>
              <div className="flex gap-4 justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {/* <div className="flex items-center gap-1.5"> */}
                  <Users className="h-4 w-4 text-primary/60" />
                  <span>Up to {roomType.maxOccupancy} guests</span>
                  {/* </div> */}
                </div>
                <div className="flex flex-wrap gap-5 mt-2 mb-2">
                  {resolvedAmenities.slice(0, 3).map((amenity) => (
                    <Tooltip key={amenity.id}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center text-muted-foreground transition-transform hover:scale-105">
                          <Icon name={amenity.icon} className="h-4 w-4" aria-hidden />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-white text-foreground border border-border/40 rounded-xl shadow-lg px-3 py-2 text-sm font-medium"
                      >
                        {amenity.name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </TooltipProvider>
          )}
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
      </div>
    </Card>
  );
}