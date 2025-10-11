import { AmenitiesHeroSection } from "@/components/marketing/amenities/HeroSection";
import { DailyRhythmSection } from "@/components/marketing/amenities/DailyRhythmSection";
import { EssentialAmenitiesGrid } from "@/components/marketing/amenities/EssentialAmenitiesGrid";

export default function AmenitiesPage() {
  return (
    <div className="bg-background text-foreground">
      <AmenitiesHeroSection />
      <EssentialAmenitiesGrid />
      <DailyRhythmSection />
    </div>
  );
}