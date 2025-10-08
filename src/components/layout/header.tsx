"use client";

import Link from "next/link";
import {
  CircleUser,
  Menu,
  Package2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDataContext } from "@/context/data-context";
import { useAuthContext } from "@/context/auth-context";
import { ThemeToggle } from "../theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import type { Permission } from "@/data/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", requiredPermission: "read:reservation" },
  { href: "/reservations", label: "Reservations", requiredPermission: "read:reservation" },
  { href: "/calendar", label: "Calendar", requiredPermission: "read:reservation" },
  { href: "/housekeeping", label: "Housekeeping", requiredPermission: "read:room" },
  { href: "/guests", label: "Guests", requiredPermission: "read:guest" },
  { href: "/reports", label: "Reports", requiredPermission: "read:report" },
] satisfies Array<{ href: string; label: string; requiredPermission: Permission }>;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { property, roles } = useDataContext();
  const { currentUser, hasPermission } = useAuthContext();
  const accessibleNavItems = navItems.filter((item) => hasPermission(item.requiredPermission));
  const activeNavItem = accessibleNavItems.find((item) => item.href === pathname);
  const pageTitle = activeNavItem?.label || "Dashboard";
  const userRole = roles.find(r => r.id === currentUser?.roleId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 px-4 shadow-sm lg:h-20 lg:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-2xl border border-border/50 bg-card/80 text-foreground shadow-sm transition-colors hover:text-primary focus-visible:ring-primary/40 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col gap-6 overflow-y-auto rounded-r-3xl border-border/50 bg-card/95 p-0 pb-8 pl-6 pr-4 shadow-lg backdrop-blur"
        >
          <nav className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4 pt-6 pr-2">
              <Package2 className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="text-lg font-serif font-semibold text-foreground">
                  {property.name}
                </span>
                <span className="text-sm text-muted-foreground">Quick navigation</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {accessibleNavItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1 overflow-hidden">
        <div className="flex flex-col gap-1">
          <h1 className="truncate text-xl font-serif font-semibold tracking-tight text-foreground">
            {pageTitle}
          </h1>
          {property?.name && (
            <p className="text-sm text-muted-foreground">{property.name}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl border border-border/50 bg-card/80 text-foreground shadow-sm transition-colors hover:text-primary"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl border border-border/50 bg-card/95 p-2 shadow-lg backdrop-blur"
          >
            <DropdownMenuLabel className="text-sm font-serif font-semibold text-foreground">
              {currentUser ? currentUser.name : "No user"}
              <p className="text-xs font-normal text-muted-foreground">
                {userRole?.name}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}