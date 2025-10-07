import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityInfoCardProps {
  title: string;
  description: string;
  imageUrl: string;
  className?: string;
}

/**
 * Render a styled card that displays an image, a title, and a description for an activity.
 *
 * @param title - The card's title and the image alt text
 * @param description - The descriptive text shown in the card body
 * @param imageUrl - Source URL for the image displayed at the top of the card
 * @param className - Optional additional CSS classes applied to the root Card element
 * @returns The card JSX element containing the image, header, and content
 */
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