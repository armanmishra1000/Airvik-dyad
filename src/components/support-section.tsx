import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Utensils, BookOpen, Home } from "lucide-react";

const supportItems = [
  {
    icon: Utensils,
    title: "Annakshetra",
    description: "Providing free, nutritious meals to all pilgrims and saints.",
  },
  {
    icon: Heart,
    title: "Gaushala",
    description: "Caring for our sacred cows in a loving, humane sanctuary.",
  },
  {
    icon: BookOpen,
    title: "Veda-Pathshala",
    description: "Preserving ancient wisdom by educating young scholars.",
  },
  {
    icon: Home,
    title: "Ashram Upkeep",
    description: "Maintaining the ashram as a clean, serene, and welcoming space.",
  },
];

export function SupportSection() {
  return (
    <section className="bg-muted/50 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight mb-4">
            Support Our Sacred Mission
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your generosity helps us continue our service to all beings. Every
            contribution, big or small, makes a profound difference in the lives
            we touch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column: What your support provides */}
          <div className="space-y-8">
            <h3 className="text-3xl font-serif font-bold text-foreground">
              How You Can Help
            </h3>
            {supportItems.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-3">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: QR Code and Donate Button */}
          <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center text-center">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
              Donate Securely
            </h3>
            <p className="text-muted-foreground mb-6">
              Scan the QR code with your payment app to contribute.
            </p>
            <div className="p-4 bg-white rounded-md shadow-inner">
              <Image
                src="/qr-code.png"
                alt="Donation QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground my-4">OR</p>
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 px-8 py-6 text-base rounded-md"
            >
              Donate via Bank Transfer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}