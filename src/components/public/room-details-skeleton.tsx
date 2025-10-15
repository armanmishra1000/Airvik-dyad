import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RoomDetailsSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-40 rounded-md" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="mb-8">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-3 rounded-3xl overflow-hidden h-[360px]">
          <Skeleton className="col-span-2 row-span-2" />
          <Skeleton className="rounded-2xl" />
          <Skeleton className="rounded-2xl" />
          <Skeleton className="rounded-2xl" />
          <Skeleton className="rounded-2xl" />
        </div>
        <Skeleton className="md:hidden aspect-video w-full rounded-lg" />
      </div>

      <div className="grid lg:grid-cols-5 gap-x-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="border border-border/50 rounded-xl p-4 space-y-6">
            <Skeleton className="h-7 w-32" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-5 w-full" />
              ))}
            </div>
          </div>

          <div className="border border-border/50 rounded-xl p-4 space-y-4">
            <Skeleton className="h-7 w-36" />
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 mt-8 lg:mt-0">
          <Card className="sticky top-32 rounded-xl shadow-xl bg-white">
            <CardHeader className="p-6 pb-4 border-b border-border/50 space-y-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="border border-border/50 rounded-xl divide-y divide-border/50 overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
