import { AmenitiesHeroSection } from "@/components/marketing/amenities/HeroSection";
import { SignatureAmenitiesSection } from "@/components/marketing/amenities/SignatureAmenitiesSection";
import { DailyRhythmSection } from "@/components/marketing/amenities/DailyRhythmSection";
import { ConciergeCtaSection } from "@/components/marketing/amenities/ConciergeCtaSection";

export default function AmenitiesPage() {
  return (
    <div className="bg-background text-foreground">
      <AmenitiesHeroSection />
      <SignatureAmenitiesSection />
      <DailyRhythmSection />
      <ConciergeCtaSection />
    </div>
  );
}
