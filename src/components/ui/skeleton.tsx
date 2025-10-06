import { cn } from "@/lib/utils"

/**
 * Renders a div element styled as a pulsing skeleton placeholder.
 *
 * @param className - Additional CSS classes appended to the component's base classes
 * @param props - Other HTML div attributes to spread onto the element
 * @returns The skeleton div element
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }