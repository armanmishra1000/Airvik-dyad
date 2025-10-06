import * as React from "react";
import { Header } from "@/components/marketing/layout/Header";
import { Footer } from "@/components/marketing/layout/Footer";
import { ScrollToTopButton } from "@/components/marketing/layout/ScrollToTopButton";

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