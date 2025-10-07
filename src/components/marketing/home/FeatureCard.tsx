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

export function FeatureCard({
  title,
  description,
  imageUrl,
  highlighted,
  className,
  href,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "bg-card overflow-hidden relative p-0 flex flex-col",
        highlighted && "ring-2 ring-primary shadow-primary/20",
        className
      )}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
          className="rounded-lg"
        />
      </div>
      <CardHeader>
        <CardTitle as="h3" className="text-2xl font-serif text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <p className="text-muted-foreground">{description}</p>
        {highlighted && (
          <div className="mt-auto pt-4">
            <Button
              asChild
              className="w-full bg-primary hover:bg-primary-hover"
            >
              <Link href={href || "#"}>Learn More</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}