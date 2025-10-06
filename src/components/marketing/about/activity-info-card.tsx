import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityInfoCardProps {
  title: string;
  description: string;
  imageUrl: string;
  className?: string;
}

/**
 * Renders a stylized information card with a top image, a heading, and a descriptive paragraph.
 *
 * @param title - The card heading text shown below the image
 * @param description - The body text displayed beneath the title
 * @param imageUrl - Source URL for the header image (used as the Image `src` and `alt` via `title`)
 * @param className - Optional additional class names merged into the card container
 * @returns The card element containing the image header, title, and description
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
        "overflow-hidden shadow-lg h-full flex flex-col group",
        className
      )}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle as="h3" className="text-2xl font-serif text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}