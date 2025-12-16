import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { HttpError, requireFeature } from "@/lib/server/auth";

import {
  RESERVATIONS_CACHE_TAG,
  RESERVATIONS_COUNT_CACHE_TAG,
} from "@/server/reservations/cache";

export async function POST(request: Request) {
  try {
    await requireFeature(request, "reservations");

    revalidateTag(RESERVATIONS_CACHE_TAG);
    revalidateTag(RESERVATIONS_COUNT_CACHE_TAG);

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { revalidated: false, message: error.message },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to revalidate cache";
    return NextResponse.json({ revalidated: false, message }, { status: 500 });
  }
}
