"use client";

import * as React from "react";
import { Images, X } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoomGalleryProps {
  roomName: string;
  photosToShow: string[];
  galleryPhotos?: string[];
  isGalleryOpen: boolean;
  onGalleryOpenChange: (open: boolean) => void;
}

export function RoomGallery({
  roomName,
  photosToShow,
  galleryPhotos: _galleryPhotos,
  isGalleryOpen,
  onGalleryOpenChange,
}: RoomGalleryProps) {
  void _galleryPhotos;
  const [mobileCarouselApi, setMobileCarouselApi] = React.useState<CarouselApi | null>(null);
  const [mobileSlideIndex, setMobileSlideIndex] = React.useState(0);

  React.useEffect(() => {
    if (!mobileCarouselApi) {
      return;
    }

    const handleSelect = () => {
      setMobileSlideIndex(mobileCarouselApi.selectedScrollSnap());
    };

    handleSelect();
    mobileCarouselApi.on("select", handleSelect);

    return () => {
      mobileCarouselApi.off("select", handleSelect);
    };
  }, [mobileCarouselApi]);

  React.useEffect(() => {
    if (!isGalleryOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isGalleryOpen]);

  return (
    <>
      <div className="mb-8">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-3 rounded-xl overflow-hidden relative h-[360px]">
          <div className="row-span-2">
            <img
              src={photosToShow[0]}
              alt={`${roomName} photo 1`}
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {photosToShow.slice(1, 3).map((photo, index) => (
              <img
                key={`top-${index}`}
                src={photo}
                alt={`${roomName} photo ${index + 2}`}
                className="h-[174px] w-full object-cover rounded-2xl"
              />
            ))}
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {photosToShow.slice(3, 5).map((photo, index) => (
              <img
                key={`bottom-${index}`}
                src={photo}
                alt={`${roomName} photo ${index + 4}`}
                className="h-[174px] w-full object-cover rounded-2xl"
              />
            ))}
          </div>
          <button
            type="button"
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-lg"
            onClick={() => onGalleryOpenChange(true)}
          >
            <Images className="h-4 w-4" />
            Show all photos
          </button>
        </div>

        <div className="md:hidden">
          <div className="relative group">
              <Carousel className="w-full" setApi={setMobileCarouselApi}>
                <CarouselContent>
                  {photosToShow.map((photo, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative rounded-xl overflow-hidden">
                      <img
                        src={photo}
                        alt={`${roomName} photo ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {photosToShow.length > 0 && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white md:hidden">
                {mobileSlideIndex + 1} / {photosToShow.length}
              </div>
            )}
            {photosToShow.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 md:hidden">
                {photosToShow.map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className={cn(
                      "h-2 w-2 rounded-full bg-white/40 transition",
                      mobileSlideIndex === dotIndex && "bg-white",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <div className="relative w-full md:max-w-xl lg:max-w-4xl">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="fixed top-6 right-6 z-[130] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-lg hover:bg-white"
                onClick={() => onGalleryOpenChange(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close gallery</span>
              </Button>
              <Carousel className="relative w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {photosToShow.map((photo, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full md:w-[90%] lg:w-full mx-auto overflow-hidden rounded-xl bg-black">
                        <img
                          src={photo}
                          alt={`${roomName} gallery photo ${index + 1}`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  variant="secondary"
                  className="hidden md:flex !left-[-56px] top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg hover:bg-white"
                />
                <CarouselNext
                  variant="secondary"
                  className="hidden md:flex !right-[-56px] top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg hover:bg-white"
                />
              </Carousel>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
