"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { currentUser } = useAppContext();
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to login if no user is authenticated
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  // Render nothing until the user is checked, to avoid flashing the layout
  if (!currentUser) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-h-screen w-full",
        isSidebarCollapsed
          ? "md:grid-cols-[56px_1fr]"
          : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
      )}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}