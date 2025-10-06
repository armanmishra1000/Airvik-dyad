"use client";

import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppSkeleton } from "@/components/layout/app-skeleton";

/**
 * Render an authentication layout that redirects authenticated users and displays the auth UI for unauthenticated users.
 *
 * Triggers a navigation to "/dashboard" when authentication has finished loading and a current user exists.
 *
 * @param children - The authentication UI to render inside the centered card (e.g., sign-in or sign-up form).
 * @returns The layout element: an AppSkeleton while redirecting for authenticated users, or a centered card containing `children` for unauthenticated users.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-3xl border border-border/40 bg-card p-8 shadow-lg sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}