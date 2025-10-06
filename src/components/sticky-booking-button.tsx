"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarCheck, Bed, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDataContext } from "@/context/data-context";

const featuredRoomMatchers = [
  {
    label: "Brahmbhoj [Semi Deluxe]",
    match: "Brahmbhoj",
  },
  {
    label: "AnnaDaan [Premium Room]",
    match: "AnnaDaan",
  },
  {
    label: "Havan Donation [Economy]",
    match: "Havan",
  },
  {
    label: "Ganga Aarti [Ganga Darshan]",
    match: "Ganga",
  },
];

/**
 * Renders a fixed, vertical "Booking" button that opens a right-side popover with featured room links.
 *
 * The popover lists predefined featured rooms; each list item links to a specific room page when a matching
 * room type exists in the data context, or falls back to the generic booking page. A footer button links to the full rooms listing.
 *
 * @returns A JSX element containing the booking trigger button and its popover content with room links.
 */
export function StickyBookingButton() {
  const { roomTypes } = useDataContext();

  const rooms = React.useMemo(() => {
    if (!roomTypes || roomTypes.length === 0) {
      return featuredRoomMatchers.map((room) => ({
        name: room.label,
        href: "/book",
      }));
    }

    return featuredRoomMatchers.map((room) => {
      const matchedRoomType = roomTypes.find((roomType) =>
        roomType.name.toLowerCase().includes(room.match.toLowerCase())
      );

      return {
        name: room.label,
        href: matchedRoomType ? `/book/rooms/${matchedRoomType.id}` : "/book",
      };
    });
  }, [roomTypes]);

  return (
    <div className="fixed top-1/2 right-0 z-50 -translate-y-1/2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="flex h-auto w-auto items-center gap-2 rounded-l-lg rounded-r-none p-3 text-base"
            style={{ writingMode: "vertical-rl" }}
          >
            <CalendarCheck className="h-5 w-5 rotate-90" />
            <span className="tracking-widest">Booking</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="center"
          sideOffset={8}
          className="w-[350px] sm:w-[400px] z-[1003] p-0 shadow-xl border-border/50"
        >
          <div className="p-6">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
              Book Your Stay
            </h3>
            <div className="flex flex-col">
              {rooms.map((room, index) => (
                <React.Fragment key={room.name}>
                  <Link
                    href={room.href}
                    className="group flex items-center justify-between gap-4 py-3 rounded-md hover:bg-muted transition-colors -mx-2 px-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-md">
                        <Bed className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {room.name}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  {index < rooms.length - 1 && <Separator className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="bg-muted/50 p-4 border-t">
            <Button asChild size="lg" className="w-full">
              <Link href="/booking">View All Rooms</Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}