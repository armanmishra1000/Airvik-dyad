"use client";

import * as React from "react";
import {
    Activity,
    ArrowUpRight,
    CircleUser,
    CreditCard,
    DollarSign,
    Menu,
    Package2,
    Search,
    Users,
    Bed,
    LogIn,
    LogOut,
  } from "lucide-react"
  
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
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
  import { format, isToday } from "date-fns"
  import { useAppContext } from "@/context/app-context";
  
  export default function DashboardPage() {
    const { reservations, guests } = useAppContext();

    const todayArrivals = reservations.filter(r => isToday(new Date(r.checkInDate)));
    const todayDepartures = reservations.filter(r => isToday(new Date(r.checkOutDate)));
    const checkedInGuests = reservations.filter(r => r.status === 'Checked-in').length;
    const availableRooms = mockRooms.filter(r => r.status === 'Clean' || r.status === 'Inspected').length;
    const occupancy = ((mockRooms.length - availableRooms) / mockRooms.length) * 100;

    return (
        <>
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
                  {mockRooms.length - availableRooms} of {mockRooms.length} rooms occupied
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
                    {todayArrivals.map(res => {
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
                    })}
                </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
    )
  }