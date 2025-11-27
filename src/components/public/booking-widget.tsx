"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Users, Minus, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReservationDateRangePicker } from "@/components/reservations/date-range-picker";

const enhancedSearchSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  roomOccupancies: z.array(
    z.object({
      adults: z.coerce.number().min(1, "At least one adult is required."),
      children: z.coerce.number().min(0),
    })
  ).min(1, "At least one room is required."),
});


export type EnhancedBookingSearchFormValues = z.infer<typeof enhancedSearchSchema>;

interface BookingWidgetProps {
  onSearch: (values: EnhancedBookingSearchFormValues) => void;
  isLoading?: boolean;
}

export function BookingWidget({ onSearch, isLoading = false }: BookingWidgetProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [guestsPopoverOpen, setGuestsPopoverOpen] = React.useState(false);
  const hasInitializedRoomState = React.useRef(false);
  
  // Simple state for UI display
  const [totalGuests, setTotalGuests] = React.useState(2);
  const [totalChildren, setTotalChildren] = React.useState(0);
  const [totalRooms, setTotalRooms] = React.useState(1);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const popoverOffset = isMobile ? 12 : 40;

  const form = useForm<EnhancedBookingSearchFormValues>({
    resolver: zodResolver(enhancedSearchSchema),
    defaultValues: {
      dateRange: {
        from: undefined,
        to: undefined,
      },
      roomOccupancies: [{ adults: 2, children: 0 }],
    },
  });

  const roomOccupancies = form.watch("roomOccupancies");
  
  // Helper function to distribute guests across rooms
  const updateRoomOccupancies = React.useCallback((guests: number, children: number, rooms: number) => {
    const adultsPerRoom = Math.floor(guests / rooms);
    const extraAdults = guests % rooms;
    const childrenPerRoom = Math.floor(children / rooms);
    const extraChildren = children % rooms;
    
    const newRoomOccupancies = Array.from({ length: rooms }, (_, index) => ({
      adults: adultsPerRoom + (index < extraAdults ? 1 : 0),
      children: childrenPerRoom + (index < extraChildren ? 1 : 0),
    }));
    
    form.setValue("roomOccupancies", newRoomOccupancies);
  }, [form]);
  
  // Update roomOccupancies when simple values change
  React.useEffect(() => {
    updateRoomOccupancies(totalGuests, totalChildren, totalRooms);
  }, [totalGuests, totalChildren, totalRooms, updateRoomOccupancies]);
  
  // Initialize simple values from roomOccupancies
  React.useEffect(() => {
    if (hasInitializedRoomState.current) return;
    if (roomOccupancies.length > 0) {
      const guests = roomOccupancies.reduce((sum, room) => sum + room.adults, 0);
      const children = roomOccupancies.reduce((sum, room) => sum + room.children, 0);
      const rooms = roomOccupancies.length;
      setTotalGuests(guests);
      setTotalChildren(children);
      setTotalRooms(rooms);
      hasInitializedRoomState.current = true;
    }
  }, [roomOccupancies]);

  return (
    <Card className="w-full bg-white max-w-5xl mx-auto backdrop-blur-md border-border/20 shadow-md">
      <div className="absolute inset-0 pointer-events-none" />
      <CardContent className="relative p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSearch)}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[2fr_1.5fr_auto] gap-6 items-start"
          >
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ReservationDateRangePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="pl-2" />
                </FormItem>
              )}
            />
            {/* Guests & Rooms Configuration */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="roomOccupancies"
                render={() => (
                  <FormItem>
                    <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full h-14 justify-start text-left font-normal text-base border hover:border-primary/50 transition-all duration-300 bg-background/50"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <Users className="mr-3 h-5 w-5 text-primary" />
                                <div className="flex flex-col items-start">
                                  <span className="text-xs text-muted-foreground">Guests & Rooms</span>
                                  <span className="text-sm font-medium">
                                    {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}{totalChildren > 0 ? `, ${totalChildren} ${totalChildren === 1 ? 'Child' : 'Children'}` : ''}, {totalRooms} {totalRooms === 1 ? 'Room' : 'Rooms'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        side="bottom"
                        align="center"
                        sideOffset={popoverOffset}
                        className="w-full max-w-[min(100vw-1.5rem,360px)] md:max-w-360 border border-border/40 rounded-2xl bg-white shadow-xl px-5 py-5"
                      >
                        <div className="space-y-5">
                            {/* Rooms */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground">Rooms</div>
                              <div className="text-sm text-muted-foreground">Number of rooms</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setTotalRooms(Math.max(1, totalRooms - 1))}
                                disabled={totalRooms <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{totalRooms}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setTotalRooms(totalRooms + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Adults */}
                          <div className="flex items-center justify-between gap-5">
                            <div>
                              <div className="font-medium text-foreground">Adults</div>
                              <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setTotalGuests(Math.max(1, totalGuests - 1))}
                                disabled={totalGuests <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{totalGuests}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setTotalGuests(totalGuests + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Children */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-foreground">Children</div>
                              <div className="text-sm text-muted-foreground">Ages 2-12</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setTotalChildren(Math.max(0, totalChildren - 1))}
                                disabled={totalChildren <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{totalChildren}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setTotalChildren(totalChildren + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                        
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="pl-2" />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading || !form.watch("dateRange.from") || !form.watch("dateRange.to")}
            >
              <Search className="h-5 w-5 mr-2" />
              {isLoading ? "Searching..." : "Search Availability"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}