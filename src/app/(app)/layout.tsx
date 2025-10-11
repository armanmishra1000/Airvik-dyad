"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/auth-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { currentUser, userRole, isLoading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    if (!currentUser) {
      router.replace("/admin/login");
      return;
    }
    const roleName = userRole?.name;
    const allowed = roleName === "Hotel Owner" || roleName === "Hotel Manager" || roleName === "Receptionist" || roleName === "Housekeeper";
    if (!allowed) {
      router.replace("/profile");
    }
  }, [currentUser, userRole, isLoading, router]);

  // After loading, if there's still no user, the effect will redirect.
  // Return null to prevent flashing the layout for an unauthenticated user.
  const roleName = userRole?.name;
  const allowed = roleName === "Hotel Owner" || roleName === "Hotel Manager" || roleName === "Receptionist" || roleName === "Housekeeper";
  if (!currentUser || !allowed) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid min-h-screen w-full overflow-x-hidden bg-background transition-colors",
        isSidebarCollapsed
          ? "md:grid-cols-[72px_1fr]"
          : "md:grid-cols-[240px_1fr] lg:grid-cols-[288px_1fr]"
      )}
    >
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex h-screen min-w-0 flex-col bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <Header />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-transparent px-4 py-4 lg:px-8 lg:py-6">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}