import { Skeleton } from "@/components/ui/skeleton";

export function AppSkeleton() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar Skeleton */}
      <div className="hidden h-screen flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-col gap-2 p-2 flex-1">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="mt-auto border-t p-2">
            <Skeleton className="h-9 w-full" />
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex flex-col h-screen">
        {/* Header Skeleton */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </header>
        {/* Page Content Skeleton */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
      </div>
    </div>
  );
}