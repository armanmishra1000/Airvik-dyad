"use client";

import Link from "next/link";
import {
  Home,
  Calendar,
  Users,
  BedDouble,
  DollarSign,
  BarChart3,
  Settings,
  Package2,
  ClipboardList,
  Layers,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-context";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/reservations", icon: Calendar, label: "Reservations" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/housekeeping", icon: ClipboardList, label: "Housekeeping" },
  { href: "/guests", icon: Users, label: "Guests" },
  { href: "/room-types", icon: Layers, label: "Room Types" },
  { href: "/rooms", icon: BedDouble, label: "Rooms" },
  { href: "/rates", icon: DollarSign, label: "Rate Plans" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { property } = useAppContext();

  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">{property.name}</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === href && "bg-muted text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/settings" && "bg-muted text-primary"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}