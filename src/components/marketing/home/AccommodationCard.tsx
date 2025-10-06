"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideProps } from "lucide-react";

interface AccommodationCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
  Icon: React.ComponentType<LucideProps>;
  href: string;
}

/**
 * Renders a marketing card for an accommodation with an image, metadata, and a "Book Now" call to action.
 *
 * @param title - The card title, displayed prominently above the description.
 * @param description - A brief description shown below the title; visually clamped to three lines.
 * @param imageUrl - Source URL for the header image shown at the top of the card.
 * @param tag - Short label shown next to the icon to highlight a feature or category.
 * @param Icon - Icon component (receives `LucideProps`) rendered next to the tag.
 * @param href - Destination URL the "Book Now" button navigates to.
 * @returns The rendered JSX element for an accommodation card.
 */
export function AccommodationCard({
  title,
  description,
  imageUrl,
  tag,
  Icon,
  href,
}: AccommodationCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-lg bg-card h-full transition-transform duration-300 hover:shadow-xl flex flex-col">
      <div className="relative h-56 w-full">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-bold text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
          <div className="flex items-center gap-2 text-primary pt-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tag}</span>
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Button asChild className="w-full bg-primary hover:bg-primary-hover">
            <Link href={href}>Book Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}