import Link from "next/link";
import { Users, Bed, Check, Sparkles } from "lucide-react";
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

interface RoomTypeCardProps {
  roomType: RoomType;
  onSelect: (roomType: RoomType) => void;
  isSelectionComplete: boolean;
  hasSearched: boolean;
  viewMode?: "card" | "grid" | "list";
}

export function RoomTypeCard({
  roomType,
  onSelect,
  isSelectionComplete,
  hasSearched,
  viewMode = "card",
}: RoomTypeCardProps) {
  const detailsLink = `/book/rooms/${roomType.id}`;

  // List view layout
  if (viewMode === "list") {
    return (
      <Card className="flex flex-col sm:flex-row bg-card border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative w-full sm:w-64 h-48 sm:h-auto">
          <img
            src={
              roomType.mainPhotoUrl ||
              roomType.photos[0] ||
              "/room-placeholder.svg"
            }
            alt={roomType.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {hasSearched && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-green-500/90 text-white border-none">
                <Check className="h-3 w-3 mr-1" />
                Available
              </Badge>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col p-4 sm:p-6">
          <div className="flex-1">
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
              {!hasSearched && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular Choice
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4">
            {hasSearched ? (
              <Button onClick={() => onSelect(roomType)} disabled={isSelectionComplete}>
                Select Room
              </Button>
            ) : (
              <Button asChild >
                <Link href={detailsLink}>View Details & Book</Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Grid view layout (more compact)
  if (viewMode === "grid") {
    return (
      <Card className="flex flex-col bg-card border-border/50 hover:shadow-md transition-all duration-300 group">
        <CardHeader className="p-0">
          <div className="aspect-[4/3] relative overflow-hidden">
            <img
              src={
                roomType.mainPhotoUrl ||
                roomType.photos[0] ||
                "/room-placeholder.svg"
              }
              alt={roomType.name}
              className="absolute inset-0 h-full w-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            />
            {hasSearched && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/90 text-white border-none text-xs px-2 py-0.5">
                  <Check className="h-2.5 w-2.5 mr-0.5" />
                  Available
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <div className="flex flex-col flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-foreground font-serif text-base">{roomType.name}</CardTitle>
            <div className="text-right">
              <div className="text-base font-bold text-primary">₹3000</div>
            </div>
          </div>
          <CardDescription className="mt-1 text-muted-foreground text-xs line-clamp-2">
            {roomType.description}
          </CardDescription>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-primary/60" />
              <span>{roomType.maxOccupancy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3 text-primary/60" />
              <span>{roomType.bedTypes[0]}</span>
            </div>
          </div>
        </div>
        <CardFooter className="p-3 pt-0">
          {hasSearched ? (
            <Button onClick={() => onSelect(roomType)} disabled={isSelectionComplete} className="w-full h-8 text-xs">
              Select
            </Button>
          ) : (
            <Button asChild className="w-full h-8 text-xs">
              <Link href={detailsLink}>View & Book</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Default card view
  return (
    <Card className="flex flex-col bg-card border-border/50 hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={
              roomType.mainPhotoUrl ||
              roomType.photos[0] ||
              "/room-placeholder.svg"
            }
            alt={roomType.name}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        {!hasSearched && roomType.amenities && roomType.amenities.length > 0 && (() => {
          const validAmenities = roomType.amenities.filter(
            amenity => !amenity.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)
          );
          return validAmenities.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {validAmenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          ) : null;
        })()}
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