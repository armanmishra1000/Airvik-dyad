import type { LucideIcon } from "lucide-react";
import {
  AirVent,
  Armchair,
  Bath,
  Bell,
  GaugeCircle,
  ShowerHead,
  WashingMachine,
  Waves,
  Wifi,
} from "lucide-react";

type Amenity = {
  label: string;
  icon: LucideIcon;
};

const amenities: Amenity[] = [
  { label: "WiFi", icon: Wifi },
  { label: "Common Area", icon: Armchair },
  { label: "Geyser", icon: GaugeCircle },
  { label: "Laundry", icon: WashingMachine },
  { label: "Air Conditioner", icon: Waves },
  { label: "Front Desk", icon: Bell },
  { label: "Towels", icon: Bath },
  { label: "Common Washroom", icon: ShowerHead },
];

export function EssentialAmenitiesGrid() {
  return (
    <section className="md:py-12 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-4 grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {amenities.map(({ label, icon: Icon }, index) => (
            <div
              key={`${label}-${index}`}
              className="group flex h-full flex-col items-center justify-center rounded-2xl border border-border/80 bg-background px-6 lg:py-8 py-4 text-center shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex lg:size-16 size-10 items-center justify-center rounded-full border border-orange-500 bg-orange-50 text-[#D26413]">
                <Icon className="lg:size-8 size-6" strokeWidth={1.5} />
              </div>
              <span className="mt-4 text-sm lg:text-base font-semibold text-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
