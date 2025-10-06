"use client";

import { SunilBhagatHeroSection } from "@/components/marketing/about/sunil-bhagat-hero-section";
import { SunilBhagatBioSection } from "@/components/marketing/about/sunil-bhagat-bio-section";
import { SunilBhagatWorkSection } from "@/components/marketing/about/sunil-bhagat-work-section";
import { SunilBhagatMessageSection } from "@/components/marketing/about/sunil-bhagat-message-section";
import { SwamiSpeechSection } from "@/components/marketing/about/swami-speech-section";

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