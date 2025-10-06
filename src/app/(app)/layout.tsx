"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/auth-context";
import { AppSkeleton } from "@/components/layout/app-skeleton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { currentUser, isLoading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    // Only check for redirection once the loading state is resolved
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoading, router]);

  // Show a skeleton while the auth state is loading initially
  if (isLoading && !currentUser) {
    return <AppSkeleton />;
  }

  // After loading, if there's still no user, the effect will redirect.
  // Return null to prevent flashing the layout for an unauthenticated user.
  if (!currentUser) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-h-screen w-full bg-background transition-colors",
        isSidebarCollapsed
          ? "md:grid-cols-[72px_1fr]"
          : "md:grid-cols-[240px_1fr] lg:grid-cols-[288px_1fr]"
      )}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex h-screen flex-col bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/40 px-6 py-4 lg:px-8 lg:py-6">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}