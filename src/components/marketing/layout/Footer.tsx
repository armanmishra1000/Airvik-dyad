import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

const quickLinks = [
  { href: "/book", label: "Rooms" },
  { href: "/about-us", label: "About Us" },
  { href: "/shop", label: "Shop" },
  { href: "/amenities", label: "Amenities" },
  { href: "/ashram-glimpse", label: "Ashram Glimpse" },
  { href: "/journey", label: "Our Journey" },
  { href: "/blog", label: "News" },
];

type SocialLink = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const socialLinks: SocialLink[] = [
  { href: "https://instagram.com/rishikeshdhamofficial", icon: Instagram },
  { href: "https://facebook.com/Rishikeshdhamofficial", icon: Facebook },
  { href: "https://linkedin.com/company/rishikeshdham", icon: Linkedin },
  { href: "https://x.com/Rishikeshdham", icon: FaXTwitter },
];

/**
 * Site footer containing logo, contact information, quick navigation links, and social icons.
 *
 * Renders a branded footer with the organization logo and subtitle, contact methods (email, phone, address),
 * a list of quick links, and social media links.
 *
 * @returns The footer React element
 */
export function Footer() {
  return (
    <footer className="border-t shadow-md">
      <div className="container mx-auto px-4 pt-16 pb-5">
        {/* First Row */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-12 mb-5">
          {/* Column 1: Logo and Subtitle */}
          <div>
            <Link href="/" className="mb-4 inline-block focus-visible:outline-none">
              <Image
                src="/logo.png"
                alt="SahajAnand Wellness Logo"
                width={360}
                height={144}
                quality={100}
                className="lg:h-24 h-[70px] w-auto"
              />
            </Link>
            <p className="text-muted-foreground max-w-md">
              A registered religious trust in Uttarakhand, dedicated to
              religious, educational, and health-related activities.
            </p>
          </div>

          {/* Column 2: Contact Details */}
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Contact Us
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <a
                href="mailto:ashram@swaminarayan.yoga"
                className="flex min-w-0 items-start gap-3 hover:text-primary transition-colors focus-visible:outline-none"
              >
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="w-full break-all">ashram@swaminarayan.yoga</span>
              </a>
              <a
                href="tel:+918511151708"
                className="flex min-w-0 items-start gap-3 hover:text-primary transition-colors focus-visible:outline-none"
              >
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="w-full break-all">+91 8511151708</span>
              </a>
              <div className="flex min-w-0 items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span className="w-full break-words">
                  Street No.13, Shisham Jhadi, Muni Ki Reti, Near Ganga Kinare,
                  Rishikesh, Uttarakhand
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Column 4: QR Code */}
          <div>
            <div className="flex flex-col lg:items-end">
              <div className="w-3/5">
                <h3 className="text-xl font-bold text-foreground mb-6 inline-block">
                  Scan to Explore
                </h3>
                <Image
                  src="/qr-code-for-website.jpg"
                  alt="Rishikesh Dham QR code"
                  width={280}
                  height={300}
                  quality={100}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border/50 pb-5"></div>

        {/* Second Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Made by Apexture Pvt. Ltd.
          </p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none"
              >
                <link.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}