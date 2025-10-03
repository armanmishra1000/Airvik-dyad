"use client";

import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { AboutHeroSection } from "@/components/about-hero-section";
import { AboutStorySection } from "@/components/about-story-section";
import { AboutActivitiesSection } from "@/components/about-activities-section";
import { PlacesToVisitSection } from "@/components/places-to-visit-section";
import { AshramFacilitiesCircleSection } from "@/components/ashram-facilities-circle-section";

export default function AboutUsPage() {
  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main>
        <AboutHeroSection />
        <AboutStorySection />
        <AboutActivitiesSection />
        <AshramFacilitiesCircleSection />
        <PlacesToVisitSection />
      </main>
      <PublicFooter />
    </div>
  );
}
