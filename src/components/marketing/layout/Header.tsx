"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ChevronDown,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
} from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
      { href: "/gallery", label: "Gallery" },
    ],
  },
  { href: "/book/review", label: "Booking" },
];

const socialLinks = [
  { href: "#", icon: Facebook },
  { href: "#", icon: Twitter },
  { href: "#", icon: Instagram },
  { href: "#", icon: Youtube },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const updateHeaderHeight = useCallback(() => {
    if (!headerRef.current) {
      return;
    }

    setHeaderHeight(headerRef.current.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      updateHeaderHeight();
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateHeaderHeight]);

  useEffect(() => {
    if (!headerRef.current) {
      return;
    }

    const node = headerRef.current;

    updateHeaderHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [updateHeaderHeight]);

  const HEADER_BASE_CLASSES =
    "fixed top-0 left-0 right-0 z-[1001] transition-all duration-300 bg-white border-b border-border";
  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          HEADER_BASE_CLASSES,
          isScrolled ? "bg-white shadow-md border-b" : ""
        )}
      >
      {/* Top Bar */}
      <div
        className={cn(
          "backdrop-blur-sm transition-all duration-300 ease-in-out bg-primary-hover/85",
          isScrolled
            ? "max-h-0 py-0 opacity-0 border-transparent"
            : "max-h-12 py-2.5 opacity-100"
        )}
        style={{ overflow: "hidden" }}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <p className="hidden text-sm font-medium text-white/90 md:block">
            Welcome to Sahajanand Ashram (Estd: 1987)
          </p>
          <p className="sm:text-sm text-xs font-medium text-white/90 md:hidden">
            Welcome to Sahajanand Ashram
          </p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 transition-colors"
              >
                <link.icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 flex items-center justify-between xl:h-24 h-20 transition-colors duration-300 text-foreground">
        <Link href="/" className="flex items-center">
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
                      <NavigationMenuTrigger className="relative inline-flex items-center rounded-2xl px-4 py-2 text-lg font-medium text-primary-hover transition-colors bg-transparent hover:bg-primary/15 hover:text-primary focus-visible:bg-primary/15 focus-visible:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40 data-[state=open]:bg-primary/15 data-[state=open]:text-primary after:absolute after:left-0 after:right-0 after:-bottom-5 after:h-3 after:content-['']">
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
                        className="inline-flex items-center rounded-2xl px-4 py-2 text-lg font-medium text-primary-hover transition-colors bg-transparent hover:bg-primary/15 hover:text-primary focus-visible:bg-primary/15 focus-visible:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40"
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
          <Link href="/book/review">BOOK NOW</Link>
        </Button>
        <div className="xl:hidden">
          <Sheet>
            <SheetTrigger asChild>
              {/* menu button */}
              <Button variant="ghost" size="icon" className="text-primary-hover">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background text-foreground z-[1002] w-full max-w-none border-none flex h-full flex-col"
            >
              <nav className="flex flex-1 flex-col space-y-2 mt-8">
                {navLinks.map((link) =>
                  link.subLinks ? (
                    <Collapsible key={link.label} className="w-full">
                      <CollapsibleTrigger className="flex justify-between items-center w-full text-lg font-medium hover:text-primary transition-colors py-2">
                        {link.label}
                        <ChevronDown className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-4 mt-2 space-y-3 border-l-2 border-border ml-2">
                          {link.subLinks.map((subLink) => (
                            <SheetClose asChild key={subLink.label}>
                              <Link
                                href={subLink.href}
                                className="block text-base text-muted-foreground hover:text-primary transition-colors"
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
                        className="text-lg font-medium hover:text-primary transition-colors py-2"
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
                  <Link href="/book/review">BOOK NOW</Link>
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      </header>
      <div
        aria-hidden="true"
        className="w-full"
        style={{ height: headerHeight }}
      />
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
            "block select-none rounded-2xl px-4 py-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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


