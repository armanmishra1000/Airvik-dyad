"use client";

import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppSkeleton } from "@/components/layout/app-skeleton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, userRole, isLoading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && currentUser) {
      const roleName = userRole?.name;
      const isAdmin = roleName === "Hotel Owner" || roleName === "Hotel Manager" || roleName === "Receptionist" || roleName === "Housekeeper";
      router.push(isAdmin ? "/admin/dashboard" : "/profile");
    }
  }, [currentUser, userRole, isLoading, router]);

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
