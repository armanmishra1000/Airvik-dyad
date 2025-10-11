"use client";

import { SunilBhagatHeroSection } from "@/components/marketing/about/sunil-bhagat-hero-section";
import { SunilBhagatUnifiedSection } from "@/components/marketing/about/sunil-bhagat-unified-section";
import { SwamiSpeechSection } from "@/components/marketing/about/swami-speech-section";

export default function SunilBhagatPage() {
  return (
    <div className="bg-background text-foreground">
      <SunilBhagatHeroSection />
      <SunilBhagatUnifiedSection />
      <SwamiSpeechSection />
    </div>
  );
}