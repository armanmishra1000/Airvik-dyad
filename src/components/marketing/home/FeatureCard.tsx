"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  imageUrl: string;
  highlighted?: boolean;
  className?: string;
  href?: string;
}

/**
 * Render a feature card showing an image, title, description, and an optional highlighted action.
 *
 * @param title - Visible title displayed in the card header
 * @param description - Body text shown below the title
 * @param imageUrl - Source URL for the card image shown at the top
 * @param highlighted - When `true`, visually emphasizes the card and shows a full-width "Learn More" action
 * @param className - Additional CSS classes applied to the root Card element
 * @param href - Destination URL for the "Learn More" link; defaults to `/book` when not provided
 * @returns A JSX element representing the feature card
 */
export function FeatureCard({
  title,
  description,
  imageUrl,
  highlighted,
  className,
  href,
}: FeatureCardProps) {
  const targetHref = href ?? "/book";
  return (
    <Card
      className={cn(
        "bg-card overflow-hidden relative flex flex-col bg-white p-2.5",
        highlighted && "ring-2 ring-primary shadow-primary/20",
        className
      )}
    >
      <div className="relative md:h-64 h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
          className="rounded-xl"
        />
      </div>
      <CardHeader>
        <CardTitle as="h3" className="text-2xl font-serif text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-col flex-grow",
          !highlighted && "justify-center gap-4"
        )}
      >
        <p className="text-muted-foreground">{description}</p>
        {/* learn more button */}
        {highlighted && (
          <div className="mt-auto pt-4">
            <Button
              asChild
              className="w-full bg-primary hover:bg-primary-hover"
            >
              <Link href={targetHref}>Book Ashram Stay</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
