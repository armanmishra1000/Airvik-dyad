"use client";

import { JourneyHeroSection } from "@/components/marketing/journey/JourneyHeroSection";
import { JourneyCTA } from "@/components/marketing/journey/JourneyCTA";

export default function JourneyPage() {
  return (
    <div className="bg-background text-foreground">
      <JourneyHeroSection />
      <JourneyCTA />
    </div>
  );
}
