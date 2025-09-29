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
  ChevronsLeft,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/auth-context";
import { useDataContext } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuthContext();
  const { property } = useDataContext();

  const accessibleNavItems = navItems.filter(item => hasPermission(item.requiredPermission as any));

  return (
    <aside className="hidden h-screen flex-col border-r bg-background transition-all duration-300 md:flex">
      <TooltipProvider delayDuration={0}>
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold overflow-hidden">
            <Package2 className="h-6 w-6 flex-shrink-0" />
            <span className={cn("whitespace-nowrap transition-all duration-300", isCollapsed && "w-0 opacity-0")}>{property.name}</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1 overflow-auto">
          {accessibleNavItems.map(({ href, icon: Icon, label }) =>
            isCollapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary",
                      pathname === href && "bg-muted text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
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
            )
          )}
        </nav>
        <div className="mt-auto border-t p-2">
          <div className="flex flex-col gap-1 items-center">
            {hasPermission('update:setting') && (
              isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary",
                        pathname === "/settings" && "bg-muted text-primary"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/settings"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === "/settings" && "bg-muted text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              )
            )}
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="icon"
              variant="ghost"
              className="h-9 w-9"
            >
              <ChevronsLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </aside>
  );
}