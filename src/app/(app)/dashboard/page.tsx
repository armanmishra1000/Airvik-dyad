"use client";

import * as React from "react";
import {
    Users,
    Bed,
    LogIn,
    LogOut,
  } from "lucide-react"
  
  import { Badge } from "@/components/ui/badge"
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
  import { mockRooms } from "@/data"
  import { isToday } from "date-fns"
  import { useAppContext } from "@/context/app-context";
  import { AvailabilityCalendar } from "./components/availability-calendar";
  
  export default function DashboardPage() {
    const { reservations, guests } = useAppContext();

    const todayArrivals = reservations.filter(r => isToday(new Date(r.checkInDate)) && r.status !== 'Cancelled');
    const todayDepartures = reservations.filter(r => isToday(new Date(r.checkOutDate)) && r.status !== 'Cancelled');
    
    const occupiedRoomsCount = reservations.filter(r => {
        const today = new Date();
        const checkIn = new Date(r.checkInDate);
        const checkOut = new Date(r.checkOutDate);
        return r.status === 'Checked-in' || (today >= checkIn && today < checkOut && r.status === 'Confirmed');
    }).length;

    const availableRooms = mockRooms.length - occupiedRoomsCount;
    const occupancy = (occupiedRoomsCount / mockRooms.length) * 100;

    return (
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Occupancy
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occupancy.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  {occupiedRoomsCount} of {mockRooms.length} rooms occupied
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Arrivals Today
                </CardTitle>
                <LogIn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{todayArrivals.length}</div>
                <p className="text-xs text-muted-foreground">
                  guests arriving
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departures Today</CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-{todayDepartures.length}</div>
                <p className="text-xs text-muted-foreground">
                  guests departing
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableRooms}</div>
                <p className="text-xs text-muted-foreground">
                  ready for check-in
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Arrivals</CardTitle>
                <CardDescription>
                  Guests scheduled to check-in today.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {todayArrivals.length > 0 ? todayArrivals.map(res => {
                        const guest = guests.find(g => g.id === res.guestId);
                        const room = mockRooms.find(r => r.id === res.roomId);
                        return (
                            <TableRow key={res.id}>
                                <TableCell>
                                    <div className="font-medium">{guest?.firstName} {guest?.lastName}</div>
                                    <div className="text-sm text-muted-foreground">{guest?.email}</div>
                                </TableCell>
                                <TableCell>{room?.roomNumber}</TableCell>
                                <TableCell className="text-right">
                                    <Badge>{res.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No arrivals today.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Today's Departures</CardTitle>
                <CardDescription>
                  Guests scheduled to check-out today.
                </CardDescription>
              </CardHeader>
              <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {todayDepartures.length > 0 ? todayDepartures.map(res => {
                        const guest = guests.find(g => g.id === res.guestId);
                        const room = mockRooms.find(r => r.id === res.roomId);
                        return (
                            <TableRow key={res.id}>
                                <TableCell>
                                    <div className="font-medium">{guest?.firstName} {guest?.lastName}</div>
                                    <div className="text-sm text-muted-foreground">{guest?.email}</div>
                                </TableCell>
                                <TableCell>{room?.roomNumber}</TableCell>
                                <TableCell className="text-right">
                                    <Badge>{res.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No departures today.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div>
            <AvailabilityCalendar />
          </div>
        </div>
    )
  }