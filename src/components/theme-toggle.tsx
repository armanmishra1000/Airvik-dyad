"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

/**
 * Render a button that toggles the UI theme between light and dark.
 *
 * The button displays a sun icon for the light theme and a moon icon for the dark theme,
 * and includes a visually hidden label for accessibility.
 *
 * @returns A React element representing the theme toggle button
 */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-2xl border border-border/50 bg-card/80 text-foreground shadow-sm transition-colors hover:text-primary focus-visible:ring-primary/40"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}