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

import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-context";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", requiredPermission: "read:reservation" },
  { href: "/reservations", icon: Calendar, label: "Reservations", requiredPermission: "read:reservation" },
  { href: "/calendar", icon: Calendar, label: "Calendar", requiredPermission: "read:reservation" },
  { href: "/housekeeping", icon: ClipboardList, label: "Housekeeping", requiredPermission: "read:room" },
  { href: "/guests", icon: Users, label: "Guests", requiredPermission: "read:guest" },
  { href: "/room-types", icon: Layers, label: "Room Types", requiredPermission: "read:room_type" },
  { href: "/rooms", icon: BedDouble, label: "Rooms", requiredPermission: "read:room" },
  { href: "/rates", icon: DollarSign, label: "Rate Plans", requiredPermission: "read:rate_plan" },
  { href: "/reports", icon: BarChart3, label: "Reports", requiredPermission: "read:report" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { property, hasPermission } = useAppContext();

  const accessibleNavItems = navItems.filter(item => hasPermission(item.requiredPermission as any));

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
            {accessibleNavItems.map(({ href, icon: Icon, label }) => (
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
          {hasPermission('update:setting') && (
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
          )}
        </div>
      </div>
    </div>
  );
}