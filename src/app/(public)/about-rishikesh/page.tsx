"use client";

import {
  RishikeshHeroSection,
  RishikeshExperienceSection,
  KeyAttractionsSection,
  MapSection
} from "@/components/marketing/about";

export default function AboutRishikeshPage() {
  return (
    <div className="bg-background text-foreground">
        <RishikeshHeroSection />
        <KeyAttractionsSection />
        <MapSection />
    </div>
  );
}