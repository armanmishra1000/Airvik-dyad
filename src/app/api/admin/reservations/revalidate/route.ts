import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  RESERVATIONS_CACHE_TAG,
  RESERVATIONS_COUNT_CACHE_TAG,
} from "@/server/reservations/cache";

export async function POST() {
  try {
    revalidateTag(RESERVATIONS_CACHE_TAG);
    revalidateTag(RESERVATIONS_COUNT_CACHE_TAG);

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to revalidate cache";
    return NextResponse.json({ revalidated: false, message }, { status: 500 });
  }
}
