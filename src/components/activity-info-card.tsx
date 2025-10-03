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