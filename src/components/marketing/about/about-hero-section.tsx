"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Award, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Renders the hero section for the About page with a background image, headline, CTAs, and credibility highlights that animate into view.
 *
 * The component observes its section element entering the viewport and toggles an internal visibility state to drive staggered entrance animations for the heading, supporting copy, buttons, and credibility items.
 *
 * @returns A JSX element containing the About page hero section.
 */
export function AboutHeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const credibilityItems = [
    {
      icon: Calendar,
      value: "30+ Years",
      label: "of Guidance",
    },
    {
      icon: Users,
      value: "10000+",
      label: "Guests Hosted",
    },
    {
      icon: Award,
      value: "Yoga Alliance",
      label: "Certified Mentors",
    },
  ];

  const newLocal = "absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-transparent";
  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[80vh] flex items-center overflow-hidden"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/rishikesh-ahsram.png"
          alt="Sahajanand Wellness Ashram in Rishikesh"
          fill
          className="object-cover"
          quality={100}
          priority
        />
        <div className={newLocal} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="gap-8 lg:gap-12 flex justify-center items-center">
          {/* Left Column: Text Content */}
          <div className="max-w-3xl">
            {/* Primary Headline */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 transition-all duration-700 transform ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              Experience Transformative Wellness
            </h1>

            {/* Supporting Copy */}
            <p
              className={`text-lg sm:text-xl text-white/90 mb-8 sm:leading-relaxed transition-all duration-700 transform ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              At Sahajanand Wellness Ashram, we blend ancient yogic wisdom with
              modern wellness practices to guide your journey toward inner peace
              and holistic health. Discover a sanctuary where transformation
              begins from within.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 mb-8 transition-all duration-700 transform ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-md"
              >
                <Link href="/rooms">Plan Your Retreat</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-md"
              >
                <Link href="/sunil-bhagat">Meet Our Guides</Link>
              </Button>
            </div>

            {/* Credibility Highlights Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {credibilityItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 transition-all duration-700 transform ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="flex-shrink-0">
                      <Icon className="w-5 h-5 text-white/80 stroke-[1.5]" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {item.value}
                      </div>
                      <div className="text-white/70 text-sm">{item.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}