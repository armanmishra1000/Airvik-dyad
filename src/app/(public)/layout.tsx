import * as React from "react";
import { Header } from "@/components/marketing/layout/Header";
import { Footer } from "@/components/marketing/layout/Footer";
import { ScrollToTopButton } from "@/components/marketing/layout/ScrollToTopButton";

/**
 * Page layout that wraps provided content with the marketing header, footer, and a scroll-to-top button.
 *
 * @param children - Content rendered inside the layout's main area.
 * @returns The layout element containing the header, `main` (with `children`), footer, and scroll-to-top button.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}