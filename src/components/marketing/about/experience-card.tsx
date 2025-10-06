import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideProps } from "lucide-react";

interface ExperienceCardProps {
  title: string;
  description: string;
  Icon: React.ComponentType<LucideProps>;
}

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