"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { AppSkeleton } from "@/components/layout/app-skeleton";
import { useSessionContext } from "@/context/session-context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading, roleName } = useSessionContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && session) {
      const isAdmin = roleName === "Hotel Owner" || roleName === "Hotel Manager" || roleName === "Receptionist" || roleName === "Housekeeper";
      router.push(isAdmin ? "/admin" : "/profile");
    }
  }, [session, roleName, isLoading, router]);

  // If a user is logged in, we are going to redirect.
  // Show a skeleton to prevent the login form from flashing.
  if (session) {
    return <AppSkeleton />;
  }

  // If there's no user, we show the login form.
  // We don't need to check for `isLoading` here, because even if we are
  // re-validating, we still want to show the form. Showing a skeleton
  // would unmount the form and lose the user's input.
  return <div>{children}</div>;
}
