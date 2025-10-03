"use client";

import { usePathname } from "next/navigation";
import { StickyBookingButton } from "@/components/public/sticky-booking-button";
import { ScrollToTopButton } from "@/components/public/scroll-to-top-button";

// Routes where buttons should NOT appear
const ADMIN_ROUTES = [
  "/dashboard",
  "/admin-rooms",
  "/reservations",
  "/guests",
  "/room-types",
  "/rates",
  "/housekeeping",
  "/reports",
  "/settings",
  "/calendar",
];

const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
];

export function GlobalUtilityButtons() {
  const pathname = usePathname();

  // Check if current path should hide buttons
  const shouldHideButtons =
    ADMIN_ROUTES.some(route => pathname.startsWith(route)) ||
    AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (shouldHideButtons) {
    return null;
  }

  return (
    <>
      <StickyBookingButton />
      <ScrollToTopButton />
    </>
  );
}