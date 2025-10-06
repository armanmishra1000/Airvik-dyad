"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Renders a floating "scroll to top" button that appears after the page is scrolled more than 300 pixels.
 *
 * The button is visually hidden and non-interactive when not visible; when clicked it smoothly scrolls the window to the top.
 *
 * @returns The component element for the scroll-to-top button whose visibility is controlled by the current scroll position.
 */
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <Button
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 h-10 w-10 rounded-md bg-primary text-primary-foreground shadow-lg transition-opacity duration-300 hover:bg-primary-hover",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
}