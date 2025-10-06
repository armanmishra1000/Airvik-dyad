"use client";

import * as React from "react";
import {
    Users,
    Bed,
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
  
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import type { DashboardComponentId } from "@/data/types"
  import { isToday } from "date-fns"
  import { useDataContext } from "@/context/data-context";
  import { AvailabilityCalendar } from "@/components/shared/availability-calendar";
  import { DashboardStickyNotes } from "./components/DashboardStickyNotes";
  import { DraggableCard } from "./components/DraggableCard";
  
  /**
   * Render the dashboard page showing occupancy stats, today’s arrivals and departures, sticky notes, and availability calendar, with an optional drag-and-drop layout editing mode.
   *
   * The component reads reservations, guests, rooms, and dashboard layout from the data context and derives today’s arrivals/departures, occupied/available rooms, and occupancy percentage. When editing is enabled, dashboard sections can be reordered via drag-and-drop and the updated layout is persisted via the context updater.
   *
   * @returns The dashboard page React element
   */
  export default function DashboardPage() {
    const { reservations, guests, dashboardLayout, updateDashboardLayout, rooms } = useDataContext();
    const [isEditing, setIsEditing] = React.useState(false);
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const todayArrivals = reservations.filter(r => isToday(new Date(r.checkInDate)) && r.status !== 'Cancelled');
    const todayDepartures = reservations.filter(r => isToday(new Date(r.checkOutDate)) && r.status !== 'Cancelled');
    
    const occupiedRoomsCount = reservations.filter(r => {
        const today = new Date();
        const checkIn = new Date(r.checkInDate);
        const checkOut = new Date(r.checkOutDate);
        return r.status === 'Checked-in' || (today >= checkIn && today < checkOut && r.status === 'Confirmed');
    }).length;

    const availableRooms = rooms.length - occupiedRoomsCount;
    const occupancy = rooms.length > 0 ? (occupiedRoomsCount / rooms.length) * 100 : 0;

    const components: Record<DashboardComponentId, React.ReactNode> = {
        stats: (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Occupancy</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-3xl font-semibold">{occupancy.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">{occupiedRoomsCount} of {rooms.length} rooms occupied</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Arrivals Today</CardTitle>
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-3xl font-semibold">+{todayArrivals.length}</div>
                        <p className="text-xs text-muted-foreground">Guests arriving</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Departures Today</CardTitle>
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-3xl font-semibold">-{todayDepartures.length}</div>
                        <p className="text-xs text-muted-foreground">Guests departing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Available Rooms</CardTitle>
                        <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-3xl font-semibold">{availableRooms}</div>
                        <p className="text-xs text-muted-foreground">Ready for check-in</p>
                    </CardContent>
                </Card>
            </div>
        ),
        tables: (
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif text-lg font-semibold">Today&apos;s Arrivals</CardTitle>
                        <CardDescription>Guests scheduled to check-in today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Guest</TableHead><TableHead>Room</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {todayArrivals.length > 0 ? todayArrivals.map(res => {
                                    const guest = guests.find(g => g.id === res.guestId);
                                    const room = rooms.find(r => r.id === res.roomId);
                                    return (<TableRow key={res.id}><TableCell><div className="font-medium">{guest?.firstName} {guest?.lastName}</div><div className="text-xs text-muted-foreground">{guest?.email}</div></TableCell><TableCell>{room?.roomNumber}</TableCell><TableCell className="text-right"><Badge variant="secondary">{res.status}</Badge></TableCell></TableRow>)
                                }) : (<TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No arrivals today.</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif text-lg font-semibold">Today&apos;s Departures</CardTitle>
                        <CardDescription>Guests scheduled to check-out today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Guest</TableHead><TableHead>Room</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {todayDepartures.length > 0 ? todayDepartures.map(res => {
                                    const guest = guests.find(g => g.id === res.guestId);
                                    const room = rooms.find(r => r.id === res.roomId);
                                    return (<TableRow key={res.id}><TableCell><div className="font-medium">{guest?.firstName} {guest?.lastName}</div><div className="text-xs text-muted-foreground">{guest?.email}</div></TableCell><TableCell>{room?.roomNumber}</TableCell><TableCell className="text-right"><Badge variant="secondary">{res.status}</Badge></TableCell></TableRow>)
                                }) : (<TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No departures today.</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        ),
        notes: <DashboardStickyNotes />,
        calendar: <AvailabilityCalendar />,
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
                    <div className="flex flex-col gap-6 md:gap-8">
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