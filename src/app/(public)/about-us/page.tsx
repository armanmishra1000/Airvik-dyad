"use client";

import { AboutHeroSection } from "@/components/marketing/about/about-hero-section";
import { AboutStorySection } from "@/components/marketing/about/about-story-section";
import { AboutActivitiesSection } from "@/components/marketing/about/about-activities-section";
import { PlacesToVisitSection } from "@/components/marketing/about/places-to-visit-section";
import { AshramFacilitiesCircleSection } from "@/components/marketing/about/ashram-facilities-circle-section";

/**
 * Renders the About Us page composed of the page's primary sections.
 *
 * @returns The root JSX element containing the hero, story, activities, ashram facilities, and places-to-visit sections.
 */
export default function AboutUsPage() {
  return (
    <div className="bg-background text-foreground">
        <AboutHeroSection />
        <AboutStorySection />
        <AboutActivitiesSection />
        <AshramFacilitiesCircleSection />
        <PlacesToVisitSection />
    </div>
  );
}