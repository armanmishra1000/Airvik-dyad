"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RoomHeaderProps {
  name: string;
  description: string;
}

export function RoomHeader({ name, description }: RoomHeaderProps) {
  const router = useRouter();
  const [shareCopied, setShareCopied] = React.useState(false);

  React.useEffect(() => {
    if (!shareCopied) {
      return;
    }

    const timeout = window.setTimeout(() => setShareCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [shareCopied]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const shareData = {
      title: name || "Room details",
      text: description,
      url: window.location.href,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        return;
      }
    } catch {
      // ignore clipboard errors
    }

    window.prompt("Copy this link", window.location.href);
  }, [description, name]);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1 text-sm font-medium">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{name}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share room details</span>
        </Button>
        {shareCopied && (
          <span className="text-xs font-semibold text-muted-foreground">
            Link copied
          </span>
        )}
      </div>
    </div>
  );
}
