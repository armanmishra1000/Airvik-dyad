"use client";

import {
  RishikeshHeroSection,
  RishikeshStorySection,
  RishikeshExperienceSection,
  KeyAttractionsSection,
  MapSection
} from "@/components/marketing/about";

/**
 * Page component that renders the About Rishikesh marketing sections.
 *
 * @returns A React element containing the About Rishikesh page layout composed of the hero, story, experience, key attractions, and map sections.
 */
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