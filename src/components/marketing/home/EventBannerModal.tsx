"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { EventBanner } from "@/data/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BannerResponse = { data: EventBanner | null };

export function EventBannerModal() {
  const [banner, setBanner] = useState<EventBanner | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const STORAGE_KEY = "eventBannerShown";
    let cancelled = false;
    let timeoutId: number | null = null;
    let loadListenerAdded = false;
    let loadHandler: (() => void) | null = null;

    const markAsShown = () => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (error) {
        console.error("Failed to persist event banner state", error);
      }
    };

    const fetchBanner = async () => {
      if (cancelled) return;
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;

      try {
        const response = await fetch("/api/event-banner/active", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const json: BannerResponse = await response.json();
        if (!cancelled && json?.data) {
          setBanner(json.data);
          setOpen(true);
          markAsShown();
        }
      } catch (error) {
        console.error("Failed to fetch event banner", error);
      }
    };

    const startTimer = () => {
      if (cancelled) return;
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;
      timeoutId = window.setTimeout(() => {
        void fetchBanner();
      }, 5000);
    };

    if (document.readyState === "complete") {
      startTimer();
    } else {
      loadHandler = () => {
        startTimer();
      };
      window.addEventListener("load", loadHandler, { once: true });
      loadListenerAdded = true;
    }

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (loadListenerAdded && loadHandler) {
        window.removeEventListener("load", loadHandler);
      }
    };
  }, []);

  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] md:max-w-3xl overflow-hidden rounded-3xl border border-border/60 p-0">
        <div className="relative">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            width={1200}
            height={700}
            className="lg:h-72 h-48 w-full object-cover"
            priority
          />
        </div>
        <div className="space-y-3 px-4 pb-4">
          <DialogHeader>
            <DialogTitle className="md:text-2xl text-lg font-semibold leading-tight text-primary">
              {banner.title}
            </DialogTitle>
            {banner.description && (
              <DialogDescription className="text-sm md:text-lg text-black/90">
                {banner.description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
