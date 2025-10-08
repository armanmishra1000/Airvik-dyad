import { AmenitiesHeroSection } from "@/components/marketing/amenities/HeroSection";
import { SignatureAmenitiesSection } from "@/components/marketing/amenities/SignatureAmenitiesSection";
import { DailyRhythmSection } from "@/components/marketing/amenities/DailyRhythmSection";
import { ConciergeCtaSection } from "@/components/marketing/amenities/ConciergeCtaSection";

/**
 * Renders the amenities page composed of hero, signature amenities, daily rhythm, and concierge call-to-action sections.
 *
 * @returns The page's JSX element containing the assembled amenities sections wrapped with background and foreground styling.
 */
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