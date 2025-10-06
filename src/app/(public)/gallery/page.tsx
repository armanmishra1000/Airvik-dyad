"use client";

import { GalleryPageSection } from "@/components/marketing/gallery/gallery-page-section";
import { GalleryHeroSection } from "@/components/marketing/gallery/gallery-hero-section";

/**
 * Renders the gallery page composed of a hero section and the gallery content within a full-height themed container.
 *
 * @returns The JSX element for the gallery page layout.
 */
export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
        <GalleryHeroSection />
        <GalleryPageSection />
    </div>
  );
}