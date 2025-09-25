"use client";

import { useAppContext } from "@/context/app-context";

export function PublicFooter() {
  const { property } = useAppContext();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {property.name}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}