"use client";

import * as React from "react";
import {
    Building2,
    Hotel,
    LogIn,
    LogOut,
    Edit,
    Check,
  } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
  
  import { Button } from "@/components/ui/button";
  import type { DashboardComponentId } from "@/data/types"
  import { isToday, parseISO } from "date-fns"
  import { useDataContext } from "@/context/data-context";
  import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
  import { DashboardStickyNotes } from "./components/DashboardStickyNotes";
  import { DraggableCard } from "./components/DraggableCard";
  import { StatCardContent } from "@/app/(app)/dashboard/components/stat-card-content";
  import { DashboardTable, type DashboardTableRow } from "@/app/(app)/dashboard/components/dashboard-table";
  import { 
    StatCardsSkeleton, 
    DashboardTableSkeleton, 
    StickyNotesSkeleton, 
    CalendarSkeleton 
  } from "./components/dashboard-skeleton";
  
  export default function DashboardPage() {
    const { reservations, guests, dashboardLayout, updateDashboardLayout, rooms, isLoading } = useDataContext();
    const [isEditing, setIsEditing] = React.useState(false);
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const todayArrivals = reservations.filter(r => isToday(parseISO(r.checkInDate)) && r.status !== 'Cancelled');
    const todayDepartures = reservations.filter(r => isToday(parseISO(r.checkOutDate)) && r.status !== 'Cancelled');
    
    const occupiedRoomsCount = reservations.filter(r => {
        const today = new Date();
        const checkIn = parseISO(r.checkInDate);
        const checkOut = parseISO(r.checkOutDate);
        return r.status === 'Checked-in' || (today >= checkIn && today < checkOut && r.status === 'Confirmed');
    }).length;

    const availableRooms = rooms.length - occupiedRoomsCount;
    const occupancy = rooms.length > 0 ? (occupiedRoomsCount / rooms.length) * 100 : 0;

    const arrivalsRows: DashboardTableRow[] = todayArrivals.map(res => {
        const guest = guests.find(g => g.id === res.guestId);
        const room = rooms.find(r => r.id === res.roomId);
        return {
            id: res.id,
            guestName: guest ? `${guest.firstName} ${guest.lastName}` : "Unknown Guest",
            guestEmail: guest?.email,
            roomNumber: room?.roomNumber || "N/A",
            status: res.status,
        };
    });

    const departuresRows: DashboardTableRow[] = todayDepartures.map(res => {
        const guest = guests.find(g => g.id === res.guestId);
        const room = rooms.find(r => r.id === res.roomId);
        return {
            id: res.id,
            guestName: guest ? `${guest.firstName} ${guest.lastName}` : "Unknown Guest",
            guestEmail: guest?.email,
            roomNumber: room?.roomNumber || "N/A",
            status: res.status,
        };
    });

    const components: Record<DashboardComponentId, React.ReactNode> = {
        stats: isLoading ? (
            <StatCardsSkeleton />
        ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatCardContent
                    icon={Building2}
                    title="Occupancy"
                    subtitle="Overall occupancy rate"
                    value={`${occupancy.toFixed(0)}%`}
                    context={`${occupiedRoomsCount} of ${rooms.length} rooms occupied`}
                />
                <StatCardContent
                    icon={LogIn}
                    title="Arrivals Today"
                    subtitle="Check-ins scheduled"
                    value={todayArrivals.length}
                    context={todayArrivals.length === 1 ? "1 guest arriving" : `${todayArrivals.length} guests arriving`}
                />
                <StatCardContent
                    icon={LogOut}
                    title="Departures Today"
                    subtitle="Check-outs scheduled"
                    value={todayDepartures.length}
                    context={todayDepartures.length === 1 ? "1 guest departing" : `${todayDepartures.length} guests departing`}
                />
                <StatCardContent
                    icon={Hotel}
                    title="Available Rooms"
                    subtitle="Ready for check-in"
                    value={availableRooms}
                    context={availableRooms === 1 ? "1 room available" : `${availableRooms} rooms available`}
                />
            </div>
        ),
        tables: isLoading ? (
            <div className="grid min-w-0 gap-6 md:gap-8 xl:grid-cols-2">
                <DashboardTableSkeleton />
                <DashboardTableSkeleton />
            </div>
        ) : (
            <div className="grid min-w-0 gap-6 md:gap-8 xl:grid-cols-2">
                <div className="flex min-w-0 flex-col rounded-2xl border border-border/60 bg-card/80 shadow-sm overflow-hidden">
                    <div className="shrink-0 border-b border-border/50 p-4">
                        <h3 className="font-serif text-lg font-semibold">Today&apos;s Arrivals</h3>
                        <p className="text-sm text-muted-foreground">Guests scheduled to check-in today.</p>
                    </div>
                    <div className="flex-1 min-w-0 p-0">
                        <DashboardTable
                            headers={["Guest", "Room", "Status"]}
                            rows={arrivalsRows}
                            emptyMessage="No arrivals today."
                        />
                    </div>
                </div>
                <div className="flex min-w-0 flex-col rounded-2xl border border-border/60 bg-card/80 shadow-sm overflow-hidden">
                    <div className="shrink-0 border-b border-border/50 p-4">
                        <h3 className="font-serif text-lg font-semibold">Today&apos;s Departures</h3>
                        <p className="text-sm text-muted-foreground">Guests scheduled to check-out today.</p>
                    </div>
                    <div className="flex-1 min-w-0 p-0">
                        <DashboardTable
                            headers={["Guest", "Room", "Status"]}
                            rows={departuresRows}
                            emptyMessage="No departures today."
                        />
                    </div>
                </div>
            </div>
        ),
        notes: isLoading ? <StickyNotesSkeleton /> : <DashboardStickyNotes />,
        calendar: isLoading ? <CalendarSkeleton /> : <AvailabilityCalendar />,
    };

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (over && active.id !== over.id) {
          const oldIndex = dashboardLayout.indexOf(active.id as DashboardComponentId);
          const newIndex = dashboardLayout.indexOf(over.id as DashboardComponentId);
          updateDashboardLayout(arrayMove(dashboardLayout, oldIndex, newIndex));
        }
        setActiveId(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Check className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                    {isEditing ? "Save Layout" : "Edit Layout"}
                </Button>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={dashboardLayout} strategy={verticalListSortingStrategy}>
                    <div className="flex min-w-0 flex-col gap-6 md:gap-8">
                        {dashboardLayout.map(id => (
                            <DraggableCard key={id} id={id} isEditing={isEditing}>
                                {components[id]}
                            </DraggableCard>
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeId ? (
                        <div className="shadow-2xl">
                            {components[activeId as DashboardComponentId]}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
  }