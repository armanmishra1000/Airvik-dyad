"use client";

import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { SunilBhagatHeroSection } from "@/components/sunil-bhagat-hero-section";
import { SunilBhagatBioSection } from "@/components/sunil-bhagat-bio-section";
import { SunilBhagatWorkSection } from "@/components/sunil-bhagat-work-section";
import { SunilBhagatMessageSection } from "@/components/sunil-bhagat-message-section";
import { SwamiSpeechSection } from "@/components/swami-speech-section";

export default function SunilBhagatPage() {
  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main>
        <SunilBhagatHeroSection />
        <SunilBhagatBioSection />
        <SunilBhagatWorkSection />
        <SunilBhagatMessageSection />
        <SwamiSpeechSection />
      </main>
      <PublicFooter />
    </div>
  );
}
