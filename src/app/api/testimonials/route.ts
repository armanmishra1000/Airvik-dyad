import { NextResponse } from "next/server";

import { getPublishedTestimonials } from "@/lib/server/testimonials";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPublishedTestimonials();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load testimonials", error);
    return NextResponse.json(
      { error: "Unable to load testimonials" },
      { status: 500 }
    );
  }
}
