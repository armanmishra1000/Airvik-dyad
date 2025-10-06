"use client";

import { SunilBhagatHeroSection } from "@/components/marketing/about/sunil-bhagat-hero-section";
import { SunilBhagatBioSection } from "@/components/marketing/about/sunil-bhagat-bio-section";
import { SunilBhagatWorkSection } from "@/components/marketing/about/sunil-bhagat-work-section";
import { SunilBhagatMessageSection } from "@/components/marketing/about/sunil-bhagat-message-section";
import { SwamiSpeechSection } from "@/components/marketing/about/swami-speech-section";

/**
 * Page component that composes the public Sunil Bhagat sections into a single layout.
 *
 * Renders the hero, bio, work, message, and swami speech sections inside a container
 * styled with background and foreground classes.
 *
 * @returns The JSX element containing the composed sections for the Sunil Bhagat page.
 */
export default function SunilBhagatPage() {
  return (
    <div className="bg-background text-foreground">
        <SunilBhagatHeroSection />
        <SunilBhagatBioSection />
        <SunilBhagatWorkSection />
        <SunilBhagatMessageSection />
        <SwamiSpeechSection />
    </div>
  );
}