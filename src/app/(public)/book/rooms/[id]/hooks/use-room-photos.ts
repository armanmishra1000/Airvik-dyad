"use client";

import * as React from "react";
import type { RoomType } from "@/data/types";

const PLACEHOLDER_IMAGE = "/room-placeholder.svg";

export function useRoomPhotos(roomType: RoomType | undefined) {
  return React.useMemo(() => {
    if (!roomType || !roomType.photos || roomType.photos.length === 0) {
      const fallback = Array(5).fill(PLACEHOLDER_IMAGE);
      return { photosToShow: fallback, galleryPhotos: fallback };
    }

    const sortedPhotos = [...roomType.photos];

    if (roomType.mainPhotoUrl) {
      const mainIndex = sortedPhotos.indexOf(roomType.mainPhotoUrl);
      if (mainIndex > -1) {
        sortedPhotos.splice(mainIndex, 1);
        sortedPhotos.unshift(roomType.mainPhotoUrl);
      }
    }

    const photosToShow = [...sortedPhotos];
    while (photosToShow.length < 5) {
      photosToShow.push(PLACEHOLDER_IMAGE);
    }

    return {
      photosToShow,
      galleryPhotos: sortedPhotos.length > 0 ? sortedPhotos : photosToShow,
    };
  }, [roomType]);
}
