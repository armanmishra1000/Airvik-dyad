"use client";

import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { GalleryPageSection } from "@/components/gallery-page-section";
import { GalleryHeroSection } from "@/components/gallery-hero-section";

export default function GalleryPage() {
  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main>
        <GalleryHeroSection />
        <GalleryPageSection />
      </main>
      <PublicFooter />
    </div>
  );
}
