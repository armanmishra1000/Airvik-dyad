"use client";

import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppSkeleton } from "@/components/layout/app-skeleton";

/**
 * Layout for authentication pages that redirects authenticated users to the dashboard.
 *
 * Renders a skeleton while redirecting signed-in users to "/dashboard" to prevent the login UI from flashing;
 * otherwise renders the provided `children` (the unauthenticated auth page content).
 *
 * @param children - The auth page content to display when no user is authenticated
 * @returns An element that is `AppSkeleton` when a user is authenticated (during redirect), or a `div` wrapping `children` when no user is present
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    // If the auth state is loaded and a user exists, redirect them away from the auth pages.
    if (!isLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, isLoading, router]);

  // If a user is logged in, we are going to redirect.
  // Show a skeleton to prevent the login form from flashing.
  if (currentUser) {
    return <AppSkeleton />;
  }

  // If there's no user, we show the login form.
  // We don't need to check for `isLoading` here, because even if we are
  // re-validating, we still want to show the form. Showing a skeleton
  // would unmount the form and lose the user's input.
  return <div>{children}</div>;
}