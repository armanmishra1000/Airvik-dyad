"use client";

import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BedDouble, Flame, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AmenityCluster = {
  title: string;
  tagline: string;
  icon: LucideIcon;
  points: string[];
  accent: string;
};

const amenityClusters: AmenityCluster[] = [
  {
    title: "Sanctuary Stays",
    tagline: "Thoughtfully appointed rooms that invite deep rest and rejuvenation.",
    icon: BedDouble,
    points: [
      "Spacious AC and non-AC rooms with handcrafted teak furniture",
      "Private balconies overlooking the Ganges and Himalayan foothills",
      "Orthopedic mattresses, Himalayan salt lamps, and calming aromatherapy",
      "Dedicated study corners with natural light for reflective journaling",
    ],
    accent: "from-primary/20 via-primary/10",
  },
  {
    title: "Purifying Rituals",
    tagline: "Spaces that honour ancient practices and personal reflection.",
    icon: Flame,
    points: [
      "Daily havan and evening aarti at the marble-clad yagya shala",
      "Meditation dome with guided pranayama and sound healing sessions",
      "Open-air pavilion for sunrise yoga facing the rising sun",
      "Quiet libraries stocked with scriptures and wellness literature",
    ],
    accent: "from-amber-200/20 via-orange-100/10",
  },
  {
    title: "Nourishing Comforts",
    tagline: "Wholesome amenities that support mindful living throughout your stay.",
    icon: UtensilsCrossed,
    points: [
      "Annakshetra dining hall serving sattvic meals prepared with spring water",
      "Herbal tea lounges featuring seasonal infusions and Ayurvedic tonics",
      "In-house organic farm produce and dairy from our goshala",
      "Warm concierge assistance for pilgrimages, therapies, and local experiences",
    ],
    accent: "from-emerald-200/20 via-green-100/10",
  },
  {
    title: "Restorative Details",
    tagline: "Considered touches that make every moment effortlessly comfortable.",
    icon: ShieldCheck,
    points: [
      "24/7 security, medical assistance, and seamless digital concierge",
      "Rainfall showers with copper fixtures and Ayurvedic bath amenities",
      "Complimentary laundry, housekeeping, and luggage assistance",
      "High-speed connectivity balanced with mindfulness-friendly quiet zones",
    ],
    accent: "from-slate-200/30 via-slate-100/10",
  },
];

/**
 * Render a responsive, animated section showcasing signature amenity cards.
 *
 * Each card displays an icon, badge, tagline, and a list of points and is revealed with staggered entrance animations.
 *
 * @returns The section's JSX element containing the header and animated amenity cards.
 */
export function SignatureAmenitiesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          className="max-w-2xl space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl">
            Signature amenities that feel deeply personal
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            From restorative stays to mindful rituals, every offering has been intentionally curated to mirror the calm of the ashram and the rhythm of the Ganges.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 lg:gap-8 sm:grid-cols-2 xl:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {amenityClusters.map(({ title, tagline, icon: Icon, points, accent }) => (
            <motion.div key={title} variants={itemVariants} className="h-full">
              <Card className="relative h-full overflow-hidden border-border/40 bg-card/70 backdrop-blur-md rounded-3xl shadow-lg shadow-primary/5">
                <div className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${accent} to-transparent`} />
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
                      {title}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight">{tagline}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                      <Sparkles className="mt-1 h-4 w-4 text-primary" />
                      <span>{point}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}