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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppContext } from "@/context/app-context";
import { ThemeToggle } from "../theme-toggle";

const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reservations", label: "Reservations" },
    { href: "/calendar", label: "Calendar" },
    { href: "/housekeeping", label: "Housekeeping" },
    { href: "/guests", label: "Guests" },
    { href: "/reports", label: "Reports" },
  ];

export function Header() {
  const pathname = usePathname();
  const { property, currentUser, users, setCurrentUser } = useAppContext();
  const pageTitle = navItems.find(item => item.href === pathname)?.label || "Dashboard";

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setCurrentUser(user || null);
  };

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
              <span className="">{property.name}</span>
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
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
                {currentUser ? currentUser.name : "No user"}
                <p className="text-xs font-normal text-muted-foreground">
                    {currentUser?.role}
                </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={currentUser?.id} onValueChange={handleUserChange}>
                <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map(user => (
                    <DropdownMenuRadioItem key={user.id} value={user.id}>
                        {user.name}
                    </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}