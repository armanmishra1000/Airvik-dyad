"use client";

import Link from "next/link";
import {
  CircleUser,
  Menu,
  Package2,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mockProperty } from "@/data";

const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reservations", label: "Reservations" },
    { href: "/calendar", label: "Calendar" },
    { href: "/housekeeping", label: "Housekeeping" },
    { href: "/guests", label: "Guests" },
  ];

export function Header() {
  const pathname = usePathname();
  const pageTitle = navItems.find(item => item.href === pathname)?.label || "Dashboard";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <Package2 className="h-6 w-6" />
              <span className="">{mockProperty.name}</span>
            </Link>
            {navItems.map(({ href, label }) => (
                 <Link
                 key={href}
                 href={href}
                 className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
               >
                 {label}
               </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}