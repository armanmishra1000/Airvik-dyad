import { notFound } from "next/navigation";
import Image from "next/image";
import { Users, Bed } from "lucide-react";
import { mockRoomTypes } from "@/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const roomType = mockRoomTypes.find((rt) => rt.id === params.id);

  if (!roomType) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative aspect-video mb-4">
            <Image
              src={roomType.photos[0] || "/room-placeholder.jpg"}
              alt={roomType.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h1 className="text-4xl font-bold font-serif">{roomType.name}</h1>
          <div className="flex items-center gap-6 text-muted-foreground mt-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Up to {roomType.maxOccupancy} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              <span>{roomType.bedTypes.join(", ")}</span>
            </div>
          </div>
          <p className="text-lg leading-relaxed">{roomType.description}</p>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Book Your Stay</CardTitle>
              <CardDescription>
                Select your dates to check availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Check-in / Check-out</Label>
                <Calendar mode="range" className="p-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={roomType.maxOccupancy}
                />
              </div>
              <Button className="w-full" disabled>
                Check Availability (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}