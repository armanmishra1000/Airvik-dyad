import { NextResponse } from "next/server";

import { getPublishedReviews } from "@/lib/server/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPublishedReviews();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load reviews", error);
    return NextResponse.json(
      { error: "Unable to load reviews" },
      { status: 500 }
    );
  }
}
