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
  FileText,
  ChevronRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Permission } from "@/data/types";

const navItems = [
  { href: "/admin", icon: Home, label: "Dashboard", requiredPermission: "read:reservation" },
  { href: "/admin/reservations", icon: Calendar, label: "Reservations", requiredPermission: "read:reservation" },
  { href: "/admin/calendar", icon: Calendar, label: "Calendar", requiredPermission: "read:reservation" },
  { 
    href: "/admin/posts", 
    icon: FileText, 
    label: "Posts", 
    requiredPermission: "read:post",
    subItems: [
      { label: "All Posts", href: "/admin/posts" },
      { label: "Add Post", href: "/admin/posts/create" },
      { label: "Categories", href: "/admin/posts/categories" },
    ]
  },
  { href: "/admin/housekeeping", icon: ClipboardList, label: "Housekeeping", requiredPermission: "read:room" },
  { href: "/admin/guests", icon: Users, label: "Guests", requiredPermission: "read:guest" },
  { href: "/admin/room-categories", icon: FolderOpen, label: "Room Categories", requiredPermission: "read:room_category" },
  { href: "/admin/room-types", icon: Layers, label: "Room Types", requiredPermission: "read:room_type" },
  { href: "/admin/rooms", icon: BedDouble, label: "Rooms", requiredPermission: "read:room" },
  { href: "/admin/rates", icon: DollarSign, label: "Rate Plans", requiredPermission: "read:rate_plan" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports", requiredPermission: "read:report" },
] satisfies Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  requiredPermission: Permission;
  subItems?: Array<{ label: string; href: string }>;
}>;

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuthContext();
  const { property } = useDataContext();

  const accessibleNavItems = navItems.filter((item) => hasPermission(item.requiredPermission));

  return (
    <aside className="hidden h-screen flex-col border-r border-border/50 bg-card/80 shadow-lg transition-colors duration-300 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:flex">
      <TooltipProvider delayDuration={0}>
        <div className={cn(
          "flex h-16 items-center border-b border-border/50 px-6 lg:h-20 transition-all duration-300",
          isCollapsed ? "justify-center px-3" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link
              href="/"
              className="flex items-center gap-3 overflow-hidden text-foreground transition-colors focus-visible:outline-none"
            >
              <Package2 className="h-6 w-6 flex-shrink-0" />
              <span className="whitespace-nowrap text-lg font-serif font-semibold tracking-tight">
                {property.name}
              </span>
            </Link>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-xl border border-border/40 hover:border-primary/40 bg-card/50 text-muted-foreground shadow-sm transition-colors hover:text-primary flex-shrink-0"
            )}
          >
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {accessibleNavItems.map((item) => {
            const { href, icon: Icon, label, subItems } = item;
            const isActive = pathname === href || (subItems && pathname.startsWith(href));

            if (isCollapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none",
                        isActive && "bg-primary/10 text-primary shadow-sm"
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
              );
            }

            if (subItems) {
              return (
                <Collapsible
                  key={href}
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none h-auto",
                        isActive && "text-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                      {subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary",
                            pathname === sub.href && "bg-primary/10 text-primary"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none",
                  isActive && "bg-primary/10 text-primary shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border/50 px-3 py-4">
          {hasPermission("update:setting") && (
            isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/settings"
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      pathname === "/admin/settings" && "bg-primary/10 text-primary shadow-sm"
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
                    href="/admin/settings"
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none",
                  pathname === "/admin/settings" && "bg-primary/10 text-primary shadow-sm"
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            )
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
