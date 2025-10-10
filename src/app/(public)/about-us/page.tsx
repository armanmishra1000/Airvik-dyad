"use client";

import { AboutHeroSection } from "@/components/marketing/about/about-hero-section";
import { AboutStorySection } from "@/components/marketing/about/about-story-section";
import { AboutActivitiesSection } from "@/components/marketing/about/about-activities-section";
import { PlacesToVisitSection } from "@/components/marketing/about/places-to-visit-section";

export default function AboutUsPage() {
  return (
    <div className="bg-background text-foreground">
        <AboutHeroSection />
        <AboutStorySection />
        <AboutActivitiesSection />
        <PlacesToVisitSection />
    </div>
  );
}