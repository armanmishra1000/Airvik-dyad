"use client";

import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Guest } from "@/data/types";

interface GuestDetailsCardProps {
  guest?: Guest;
}

export function GuestDetailsCard({ guest }: GuestDetailsCardProps) {
  if (!guest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guest Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Guest details not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Information</CardTitle>
        <CardDescription>
          Details of the primary guest for this reservation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="flex items-center gap-3 text-base font-semibold">
          <User className="h-5 w-5 text-muted-foreground" />
          {guest.firstName} {guest.lastName}
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{guest.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{guest.phone || "Not provided"}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border/40 px-6 py-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/guests/${guest.id}`}>View Guest Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}