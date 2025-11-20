"use client";

import { JourneyHeroSection } from "@/components/marketing/journey/JourneyHeroSection";
import { JourneyTimeline } from "@/components/marketing/journey/JourneyTimeline";
import { JourneyCTA } from "@/components/marketing/journey/JourneyCTA";

export default function JourneyPage() {
  return (
    <div className="bg-background text-foreground">
      <JourneyHeroSection />
      <JourneyTimeline />
      <JourneyCTA />
    </div>
  );
}
