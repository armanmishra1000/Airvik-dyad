"use client";

import { GalleryPageSection } from "@/components/marketing/gallery/gallery-page-section";
import { GalleryHeroSection } from "@/components/marketing/gallery/gallery-hero-section";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
        <GalleryHeroSection />
        <GalleryPageSection />
    </div>
  );
}