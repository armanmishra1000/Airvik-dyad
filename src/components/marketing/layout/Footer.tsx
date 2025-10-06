import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Youtube } from "lucide-react";

const quickLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "#", label: "Rooms" },
];

const socialLinks = [
  { href: "#", icon: Facebook },
  { href: "#", icon: Twitter },
  { href: "#", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Column 1: Logo and Subtitle */}
          <div>
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/marketing/logo.png"
                alt="SahajAnand Wellness Logo"
                width={360}
                height={144}
                quality={100}
                className="h-24 w-auto"
              />
            </Link>
            <p className="text-muted-foreground max-w-md">
              A registered religious trust in Uttarakhand, dedicated to
              religious, educational, and health-related activities.
            </p>
          </div>

          {/* Column 2: Contact Details */}
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-6">
              Contact Us
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <a
                href="mailto:ashram@swaminarayan.yoga"
                className="flex items-center gap-3 hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>ashram@swaminarayan.yoga</span>
              </a>
              <a
                href="tel:+918511151708"
                className="flex items-center gap-3 hover:text-primary transition-colors"
              >
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>+91 8511151708</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span>
                  Street No.13, Shisham Jhadi, Muni Ki Reti, Near Ganga Kinare,
                  Rishikesh, Uttarakhand
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Links */}
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border/50 my-8"></div>

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
                className="text-muted-foreground hover:text-primary transition-colors"
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
