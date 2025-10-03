"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type PageSkeletonType =
  | "home"
  | "about-us"
  | "about-rishikesh"
  | "gallery"
  | "sunil-bhagat";

interface PageSkeletonProps {
  page: PageSkeletonType;
}

const HeaderSkeleton = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-muted/50 shadow-lg">
    <div className="container mx-auto flex items-center justify-between p-2 h-[96px]">
      <Skeleton className="h-12 w-48" />
      <div className="hidden md:flex items-center space-x-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="hidden md:block h-10 w-32" />
      <Skeleton className="md:hidden h-8 w-8" />
    </div>
  </header>
);

const HomeMainSkeleton = () => (
  <>
    {/* Hero Skeleton */}
    <section className="relative w-full h-[70vh] bg-muted/50 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-16 w-[600px] mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>
    </section>

    {/* Features Skeleton */}
    <section className="relative -mt-24 pb-20">
      <div className="container mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-full mt-2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </section>

    {/* Welcome Section Skeleton */}
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      </div>
    </section>
  </>
);

const AboutUsMainSkeleton = () => (
  <>
    <Skeleton className="w-full h-[200px] sm:h-[300px]" />
    <section className="py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-6 lg:mb-16">
          <Skeleton className="h-5 w-20 mx-auto mb-4" />
          <Skeleton className="h-12 w-3/4 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </div>
    </section>
    <section className="bg-muted/50 py-14 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Skeleton className="h-12 w-3/4 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

const AboutRishikeshMainSkeleton = () => (
  <>
    <Skeleton className="w-full h-[200px] sm:h-[300px]" />
    <section className="py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 lg:mb-16 md:mb-12">
          <Skeleton className="h-12 w-3/4 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </div>
    </section>
    <section className="relative py-20 sm:py-28 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 p-6 bg-card rounded-lg">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full mx-auto" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
    <section className="py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-1/2 mx-auto" />
        </div>
        <Skeleton className="w-full h-[450px] rounded-lg" />
      </div>
    </section>
  </>
);

const GalleryMainSkeleton = () => (
  <>
    <Skeleton className="w-full h-[200px] sm:h-[300px]" />
    <section className="bg-background py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
          <Skeleton className="h-10 w-10 mx-auto mt-6" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white p-1.5 shadow-lg">
              <Skeleton className="h-52 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

const SunilBhagatMainSkeleton = () => (
  <>
    <Skeleton className="w-full h-[200px] sm:h-[300px]" />
    <section className="py-10 lg:py-28 md:py-18">
      <div className="container mx-auto px-4">
        <div className="text-center lg:mb-16 md:mb-12">
          <Skeleton className="h-12 w-3/4 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <Skeleton className="w-full h-80 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      </div>
    </section>
    <section className="mb-6 lg:mb-20 md:mb-12">
      <div className="container mx-auto px-4">
        <div className="lg:text-left space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </section>
  </>
);

const pageSkeletons: Record<PageSkeletonType, React.FC> = {
  home: HomeMainSkeleton,
  "about-us": AboutUsMainSkeleton,
  "about-rishikesh": AboutRishikeshMainSkeleton,
  gallery: GalleryMainSkeleton,
  "sunil-bhagat": SunilBhagatMainSkeleton,
};

export function PageSkeleton({ page }: PageSkeletonProps) {
  const MainSkeleton = pageSkeletons[page];
  const mainPadding = page !== "home" ? "pt-[96px]" : "";

  return (
    <div className="bg-background">
      <HeaderSkeleton />
      <main className={cn("animate-pulse", mainPadding)}>
        <MainSkeleton />
      </main>
    </div>
  );
}