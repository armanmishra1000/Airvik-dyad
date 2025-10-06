"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
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
  FolderOpen,
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
import type { Permission } from "@/data/types";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", requiredPermission: "read:reservation" },
  { href: "/reservations", icon: Calendar, label: "Reservations", requiredPermission: "read:reservation" },
  { href: "/calendar", icon: Calendar, label: "Calendar", requiredPermission: "read:reservation" },
  { href: "/housekeeping", icon: ClipboardList, label: "Housekeeping", requiredPermission: "read:room" },
  { href: "/guests", icon: Users, label: "Guests", requiredPermission: "read:guest" },
  { href: "/room-categories", icon: FolderOpen, label: "Room Categories", requiredPermission: "read:room_category" },
  { href: "/room-types", icon: Layers, label: "Room Types", requiredPermission: "read:room_type" },
  { href: "/rooms", icon: BedDouble, label: "Rooms", requiredPermission: "read:room" },
  { href: "/rates", icon: DollarSign, label: "Rate Plans", requiredPermission: "read:rate_plan" },
  { href: "/reports", icon: BarChart3, label: "Reports", requiredPermission: "read:report" },
] satisfies Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  requiredPermission: Permission;
}>;

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Render the application's sidebar with navigation, settings, and a collapse toggle.
 *
 * The sidebar displays navigation items filtered by the current user's permissions,
 * highlights the active route, and adapts its layout based on the `isCollapsed` state.
 *
 * @param isCollapsed - Whether the sidebar is collapsed (icon-only) or expanded (full labels)
 * @param setIsCollapsed - State setter called to toggle the collapsed state
 * @returns The sidebar element containing navigation links, an optional settings control, and a toggle button
 */
export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuthContext();
  const { property } = useDataContext();

  const accessibleNavItems = navItems.filter((item) => hasPermission(item.requiredPermission));

  return (
    <aside className="hidden h-screen flex-col border-r border-border/50 bg-card/80 shadow-lg transition-colors duration-300 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:flex">
      <TooltipProvider delayDuration={0}>
        <div className="flex h-16 items-center border-b border-border/50 px-6 lg:h-20">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden text-foreground transition-colors"
          >
            <Package2 className="h-6 w-6 flex-shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap text-lg font-serif font-semibold tracking-tight transition-all duration-300",
                isCollapsed && "w-0 opacity-0"
              )}
            >
              {property.name}
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {accessibleNavItems.map(({ href, icon: Icon, label }) =>
            isCollapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      pathname === href && "bg-primary/10 text-primary shadow-sm"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="rounded-2xl border border-border/50 bg-card/90 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur"
                >
                  {label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  pathname === href && "bg-primary/10 text-primary shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          )}
        </nav>
        <div className="mt-auto border-t border-border/50 px-3 py-4">
          <div className="flex flex-col items-center gap-2">
            {hasPermission("update:setting") && (
              isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        pathname === "/settings" && "bg-primary/10 text-primary shadow-sm"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Settings</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="rounded-2xl border border-border/50 bg-card/90 px-3 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur"
                  >
                    Settings
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/settings"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    pathname === "/settings" && "bg-primary/10 text-primary shadow-sm"
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
              className="h-11 w-11 rounded-2xl border border-border/50 bg-card/80 text-muted-foreground shadow-sm transition-colors hover:text-primary"
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