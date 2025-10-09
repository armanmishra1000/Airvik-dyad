import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RoomDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Image Gallery Skeleton */}
      <div className="mb-8">
        <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[80vh] max-h-[500px]">
          <Skeleton className="md:col-span-2 md:row-span-2 rounded-lg" />
          <Skeleton className="md:col-span-2 rounded-lg" />
          <Skeleton className="md:col-span-2 rounded-lg" />
        </div>
        <div className="md:hidden aspect-video">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-x-12">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Amenities Skeleton */}
          <div className="border border-border/50 rounded-xl p-4">
            <Skeleton className="h-7 w-32 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>

          {/* Rules Skeleton */}
          <div className="border border-border/50 rounded-xl p-4">
            <Skeleton className="h-7 w-40 mb-6" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card Skeleton */}
        <div className="lg:col-span-2 mt-8 lg:mt-0">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="border rounded-lg divide-y divide-border">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Rooms Skeleton */}
      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
