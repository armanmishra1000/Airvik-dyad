"use client";

import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Guest } from "@/data/types";

interface GuestDetailsCardProps {
  guest?: Guest;
}

/**
 * Render a card displaying the primary guest's details and a link to their profile.
 *
 * Shows the guest's full name, email, and phone number (or "Not provided" when phone is missing).
 * When `guest` is not supplied, renders a fallback card with a "Guest details not found." message.
 *
 * @param guest - The guest to display; if omitted, a fallback view is rendered.
 * @returns A Card element containing guest information or a fallback message.
 */
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
      <CardContent className="space-y-4">
        <div className="flex items-center font-semibold">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          {guest.firstName} {guest.lastName}
        </div>
        <div className="flex items-center text-sm">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          {guest.email}
        </div>
        <div className="flex items-center text-sm">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          {guest.phone || "Not provided"}
        </div>
      </CardContent>
      <div className="border-t p-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/guests/${guest.id}`}>View Guest Profile</Link>
        </Button>
      </div>
    </Card>
  );
}