"use client";

import {
  RishikeshHeroSection,
  RishikeshStorySection,
  RishikeshExperienceSection,
  KeyAttractionsSection,
  MapSection
} from "@/components/marketing/about";

export default function AboutRishikeshPage() {
  return (
    <div className="bg-background text-foreground">
        <RishikeshHeroSection />
        <RishikeshStorySection />
        <RishikeshExperienceSection />
        <KeyAttractionsSection />
        <MapSection />
    </div>
  );
}