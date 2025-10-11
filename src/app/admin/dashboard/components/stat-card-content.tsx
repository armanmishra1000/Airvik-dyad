import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardContentProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  value: string | number;
  context?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  className?: string;
}

export function StatCardContent({
  icon: Icon,
  title,
  subtitle,
  value,
  context,
  trend,
  className,
}: StatCardContentProps) {
  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition-colors hover:border-border",
        className
      )}
    >
      <div className="flex flex-row items-start justify-between gap-3 space-y-0 sm:p-6 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-sm font-semibold uppercase tracking-wide">
            {title}
          </h3>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className="space-y-3 sm:px-6 px-4 sm:pb-6 pb-4">
        <div className="flex items-baseline gap-2">
          <div className="min-w-0 truncate text-3xl font-semibold tracking-tight sm:text-4xl">
            {value}
          </div>
          {trend && (
            <Badge
              variant="secondary"
              className={cn(
                "flex-shrink-0 gap-1 font-medium",
                trend.direction === "up"
                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
              )}
            >
              {trend.direction === "up" ? "▲" : "▼"} {trend.value}
            </Badge>
          )}
        </div>
        {context && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {context}
          </p>
        )}
      </div>
    </div>
  );
}
