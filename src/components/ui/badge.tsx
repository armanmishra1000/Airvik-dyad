import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  {
    variants: {
      variant: {
        default:
          "border border-primary/30 bg-primary/10 text-primary",
        secondary:
          "border border-border/40 bg-muted/50 text-muted-foreground",
        destructive:
          "border border-destructive/40 bg-destructive/10 text-destructive",
        outline:
          "border border-border/60 bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Renders a compact badge element whose visual style is determined by the `variant` prop.
 *
 * @param className - Additional CSS classes to merge with the component's variant classes.
 * @param variant - Visual variant to apply (derived from `badgeVariants`); controls border, background, and text styles.
 * @param props - Additional HTML div attributes that will be forwarded to the underlying element.
 * @returns The badge as a JSX element.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }