import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideProps } from "lucide-react";

interface ExperienceCardProps {
  title: string;
  description: string;
  Icon: React.ComponentType<LucideProps>;
}

/**
 * Render a styled card showing an icon, title, and description.
 *
 * @param title - The card's title text
 * @param description - The descriptive text shown in the card content
 * @param Icon - A React component (accepting `LucideProps`) used as the card's icon
 * @returns A React element representing the styled experience card
 */
export function ExperienceCard({
  title,
  description,
  Icon,
}: ExperienceCardProps) {
  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50 shadow-lg h-full text-center transition-all duration-300 hover:bg-background/90 hover:shadow-xl">
      <CardHeader className="items-center">
        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle as="h3" className="text-2xl font-serif text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}