import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityInfoCardProps {
  title: string;
  description: string;
  imageUrl: string;
  className?: string;
}

export function ActivityInfoCard({
  title,
  description,
  imageUrl,
  className,
}: ActivityInfoCardProps) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border/60 bg-background shadow-sm transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[3/2] w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        </div>
      </div>
      <CardHeader className="space-y-2">
        <CardTitle as="h3" className="text-2xl font-serif text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-base text-muted-foreground">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}