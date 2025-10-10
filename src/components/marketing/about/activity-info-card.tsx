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
        "group flex h-full flex-col overflow-hidden border border-border/50 bg-background shadow-sm transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      </div>
      <CardHeader className="space-y-2 px-4 pt-4 pb-0">
        <CardTitle as="h3" className="text-2xl font-serif font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-base text-muted-foreground px-4 pb-4 mt-2">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}