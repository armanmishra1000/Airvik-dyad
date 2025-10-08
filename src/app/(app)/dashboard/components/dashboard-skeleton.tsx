import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardTableSkeleton() {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border/60 bg-card/80 shadow-sm overflow-hidden">
      <div className="shrink-0 border-b border-border/50 p-4 space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex-1 min-w-0 p-0">
        <div className="min-h-[320px] md:min-h-[420px] lg:min-h-[min(60vh,560px)]">
          {/* Header */}
          <div className="border-b border-border/40">
            <div className="grid grid-cols-[2fr,1fr,1fr] gap-2 px-4 py-3 bg-muted/70">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-border/30">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr,1fr,1fr] gap-2 px-4 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StickyNotesSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 shadow-sm">
      <div className="flex flex-row items-center justify-between border-b border-border/50 sm:p-6 p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <div className="sm:p-6 p-4">
        <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-thin">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[240px] sm:w-[260px]">
              <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-7 rounded-md" />
                </div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 shadow-sm">
      <div className="border-b border-border/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border/40 bg-background/50 px-2 sm:px-3 py-2 w-fit">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
            <Skeleton className="h-5 w-[120px] sm:w-[140px]" />
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/50 shadow-sm">
          <div className="min-w-max p-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
