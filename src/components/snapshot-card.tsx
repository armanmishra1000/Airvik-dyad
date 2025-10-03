import Image from "next/image";
import { Card } from "@/components/ui/card";
import { LucideProps } from "lucide-react";
import React from "react";

interface SnapshotCardProps {
  imageUrl: string;
  title: string;
  description: string;
  Icon: React.ComponentType<LucideProps>;
}

export function SnapshotCard({
  imageUrl,
  title,
  description,
  Icon,
}: SnapshotCardProps) {
  return (
    <Card className="relative group overflow-hidden rounded-lg shadow-lg h-80 text-white">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/80 text-primary-foreground rounded-full p-2 w-fit">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-2xl font-serif font-bold">{title}</h3>
        </div>
        <p className="mt-1 text-base text-primary-foreground/80">
          {description}
        </p>
      </div>
    </Card>
  );
}