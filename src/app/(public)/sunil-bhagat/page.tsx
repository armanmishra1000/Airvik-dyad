"use client";

import { SunilBhagatUnifiedSection } from "@/components/marketing/about/sunil-bhagat-unified-section";
import { SwamiSpeechSection } from "@/components/marketing/about/swami-speech-section";

export default function SunilBhagatPage() {
  return (
    <div className="bg-background text-foreground">
      <SunilBhagatUnifiedSection />
      <SwamiSpeechSection />
    </div>
  );
}