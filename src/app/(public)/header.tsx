"use client";

import Link from "next/link";
import { Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-context";

export function PublicHeader() {
  const { property } = useAppContext();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span className="">{property.name}</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Admin Login</Link>
          </Button>
          <Button>Book Now</Button>
        </nav>
      </div>
    </header>
  );
}