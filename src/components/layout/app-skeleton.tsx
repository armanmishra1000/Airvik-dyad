import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders a responsive two-column skeleton UI shown while application content is loading.
 *
 * The layout includes a sidebar (hidden on small screens) with a header, eight menu placeholders, and a footer action placeholder, and a main content area with a sticky header, four skeleton cards, and a large content block.
 *
 * @returns The JSX element representing the skeleton layout.
 */
export function AppSkeleton() {
  return (
    <div className="grid min-h-screen w-full bg-background md:grid-cols-[240px_1fr] lg:grid-cols-[288px_1fr]">
      {/* Sidebar Skeleton */}
      <div className="hidden h-screen flex-col border-r border-border/50 bg-card/80 shadow-lg md:flex">
        <div className="flex h-16 items-center border-b border-border/50 px-6 lg:h-20">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 py-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mt-auto border-t border-border/50 px-3 py-4">
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex h-screen flex-col bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-20 lg:px-8">
          <div className="w-full flex-1">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-11 w-11 rounded-2xl" />
          </div>
        </header>
        {/* Page Content Skeleton */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/40 px-6 py-4 lg:px-8 lg:py-6">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl shadow-sm" />
                ))}
              </div>
              <Skeleton className="h-96 w-full rounded-2xl shadow-sm" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}