"use client";

import * as React from "react";

// This breakpoint now includes common tablet sizes (e.g., up to 1024px).
const TABLET_BREAKPOINT = 1024;

/**
 * Determines whether the current viewport width is below the tablet breakpoint (1024px).
 *
 * The returned value updates in response to viewport size changes.
 *
 * @returns `true` if the viewport width is less than 1024 pixels, `false` otherwise.
 */
export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<
    boolean | undefined
  >(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobileOrTablet(window.innerWidth < TABLET_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobileOrTablet;
}