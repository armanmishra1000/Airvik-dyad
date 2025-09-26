"use client";

import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppSkeleton } from "@/components/layout/app-skeleton";

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
  return <>{children}</>;
}