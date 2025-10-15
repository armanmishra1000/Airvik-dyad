"use client";

import * as React from "react";
import { MapPin, Users, Star, Clock, Info, ParkingCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@/components/shared/icon";
import type { Amenity, RoomType } from "@/data/types";
import { ESSENTIAL_AMENITIES, amenityIcons } from "../constants/amenities";

interface RoomDetailsProps {
  roomType: RoomType;
  amenities: Amenity[];
}

export function RoomDetails({ roomType, amenities }: RoomDetailsProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);

  const description = roomType.description;
  const truncatedDescription =
    description.length > 200 ? `${description.substring(0, 200)}...` : description;

  const renderAmenity = (amenityId: string) => {
    const amenity = amenities.find((item) => item.id === amenityId);
    if (!amenity) {
      return null;
    }

    return (
      <div key={amenity.id} className="flex items-center gap-3">
        <Icon name={amenityIcons[amenity.name] || amenity.icon} className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
      </div>
    );
  };

  const essentialAmenities = roomType.amenities.filter((amenityId) => {
    const amenity = amenities.find((item) => item.id === amenityId);
    return amenity && ESSENTIAL_AMENITIES.includes(amenity.name as (typeof ESSENTIAL_AMENITIES)[number]);
  });

  const comfortAmenities = roomType.amenities.filter((amenityId) => {
    const amenity = amenities.find((item) => item.id === amenityId);
    return amenity && !ESSENTIAL_AMENITIES.includes(amenity.name as (typeof ESSENTIAL_AMENITIES)[number]);
  });

  return (
    <>
      <div>
        <h1 className="sm:text-2xl text-2xl lg:text-3xl font-bold font-serif text-foreground">
          {roomType.name}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>Rishikesh, Uttarakhand</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Up to {roomType.maxOccupancy} guests</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-foreground">4.5</span>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed">
        {isDescriptionExpanded ? description : truncatedDescription}
        {description.length > 50 && (
          <Button
            variant="link"
            className="p-0 h-auto ml-2"
            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
          >
            {isDescriptionExpanded ? "Read Less" : "Read More"}
          </Button>
        )}
      </p>

      <div className="border-t border-border my-6" />

      <div className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-2 gap-4">
              {essentialAmenities.map((amenityId) => renderAmenity(amenityId))}
            </div>
          </div>
          <div className="mt-0 !mt-4">
            <div className="grid grid-cols-2 gap-4">
              {comfortAmenities.map((amenityId) => renderAmenity(amenityId))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border my-6" />

      <div className="bg-white">
        <h2 className="text-2xl font-bold text-gray-900 ">Ashram Rules</h2>
        <Accordion type="single" collapsible className="w-full p-4">
          <AccordionItem value="checkin" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 " />
                <span className="text-left font-medium">Check-in &amp; Check-out</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pl-8">
                <div className="text-sm">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="ml-2 font-medium">3:00 PM - 11:00 PM</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="ml-2 font-medium">Before 12:00 PM</span>
                </div>
                <div className="text-sm text-gray-500">
                  Late check-out may be available upon request
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="age" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5" />
                <span className="text-left font-medium">Age &amp; ID Requirements</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pl-8 text-sm text-gray-600">
                <p>Minimum age to check-in: 17 years</p>
                <p>Valid government-issued photo ID required at check-in</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="parking" className="border-b">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <ParkingCircle className="h-5 w-5" />
                <span className="text-left font-medium">Parking &amp; Transportation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pl-8 text-sm text-gray-600">
                <p>Free parking available (5 spaces)</p>
                <p>First-come, first-served basis</p>
                <p>Valet service not available</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
