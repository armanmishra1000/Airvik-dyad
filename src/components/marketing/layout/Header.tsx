"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Rooms" },
  {
    label: "About Us",
    subLinks: [
      { href: "/about-us", label: "About Ashram" },
      { href: "/sunil-bhagat", label: "About Sunil Bhagat" },
      { href: "/about-rishikesh", label: "About Rishikesh" },
    ],
  },
  { href: "/shop", label: "Shop" },
  { href: "/amenities", label: "Amenities" },
  { href: "/ashram-glimpse", label: "Ashram Glimpse" },
  { href: "/journey", label: "Our Journey" },
];

type SocialLink = {
  href: string;
  name: string;
  icon: IconType;
};

const socialLinks: SocialLink[] = [
  {
    href: "https://instagram.com/rishikeshdhamofficial",
    name: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "https://facebook.com/Rishikeshdhamofficial",
    name: "Facebook",
    icon: FaFacebook,
  },
  {
    href: "https://linkedin.com/company/rishikeshdham",
    name: "LinkedIn",
    icon: FaLinkedin,
  },
  {
    href: "https://x.com/Rishikeshdham",
    name: "X (Twitter)",
    icon: FaXTwitter,
  },
];

export function Header() {
  return (
    <>
      <header className="border-b border-border bg-white sticky top-0 z-40 w-full">
        {/* topbar content */}
        <div className="hidden md:block bg-primary-hover">
          <div className="container mx-auto flex h-12 items-center justify-between px-4">
            <p className="text-sm font-medium text-white/90">
              Swaminarayan Ashram (Estd: 1987)
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 focus-visible:outline-none"
                  aria-label={link.name}
                  title={link.name}
                >
                  <link.icon
                    className="size-5"
                    aria-hidden="true"
                    focusable="false"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto flex h-20 items-center justify-between px-4 text-foreground xl:h-24">
          <Link href="/" className="flex items-center focus-visible:outline-none">
            <Image
              src="/logo.png"
              alt="SahajAnand Wellness Logo"
              width={360}
              height={160}
              quality={100}
              priority
              className="h-16 w-auto xl:h-20"
            />
          </Link>
          <nav className="hidden xl:flex space-x-1 self-stretch">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.label}>
                    {link.subLinks ? (
                      <>
                        <NavigationMenuTrigger className="relative inline-flex items-center rounded-2xl px-4 py-2 text-lg font-medium text-primary-hover bg-transparent hover:bg-primary/15 hover:text-primary focus-visible:outline-none data-[state=open]:bg-primary/15 data-[state=open]:text-primary after:absolute after:left-0 after:right-0 after:-bottom-5 after:h-3 after:content-['']">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[240px] gap-1 p-2">
                            {link.subLinks.map((subLink) => (
                              <ListItem
                                key={subLink.label}
                                href={subLink.href}
                                title={subLink.label}
                              />
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.href || "#"}
                          className="inline-flex items-center rounded-2xl px-4 py-2 text-lg font-medium text-primary-hover bg-transparent hover:bg-primary/15 hover:text-primary focus-visible:outline-none"
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          <Button
            asChild
            className="hidden bg-primary hover:bg-primary-hover text-primary-foreground xl:flex justify-center text-center"
          >
            <Link href="/book">BOOK NOW</Link>
          </Button>
          <div className="xl:hidden">
            <Sheet>
              <SheetTrigger asChild>
                {/* menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-hover focus-visible:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background text-foreground z-[1100] w-full max-w-none border-none flex h-full flex-col"
              >
                <nav className="flex flex-1 flex-col space-y-2 mt-8">
                  {navLinks.map((link) =>
                    link.subLinks ? (
                      <Collapsible key={link.label} className="w-full">
                        <CollapsibleTrigger className="flex justify-between items-center w-full text-lg font-medium hover:text-primary py-2 focus-visible:outline-none [&[data-state=open]>svg]:rotate-180">
                          {link.label}
                          <ChevronDown className="h-5 w-5 transition-transform" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-4 mt-2 space-y-3 border-l-2 border-border ml-2">
                            {link.subLinks.map((subLink) => (
                              <SheetClose asChild key={subLink.label}>
                                <Link
                                  href={subLink.href}
                                  className="block text-base text-muted-foreground hover:text-primary focus-visible:outline-none"
                                >
                                  {subLink.label}
                                </Link>
                              </SheetClose>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SheetClose asChild key={link.label}>
                        <Link
                          href={link.href}
                          className="text-lg font-medium hover:text-primary py-2 focus-visible:outline-none"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    )
                  )}
                </nav>
                <SheetClose asChild>
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary-hover text-primary-foreground mt-8 flex w-full justify-center text-center"
                  >
                    <Link href="/book">BOOK NOW</Link>
                  </Button>
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none rounded-2xl px-4 py-3 leading-none no-underline outline-none hover:bg-primary/15 hover:text-primary focus-visible:outline-none",
            className
          )}
          {...props}
        >
          <div className="text-base leading-none text-primary-hover hover:text-primary">
            {title}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
