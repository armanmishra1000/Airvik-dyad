import { NextResponse, type NextRequest } from "next/server";

import { HttpError, requireFeature } from "@/lib/server/auth";

import {
  clampReservationPageParams,
  getCachedReservationsCount,
  getCachedReservationsPage,
} from "@/server/reservations/cache";

type ReservationsApiResponse = {
  data: Awaited<ReturnType<typeof getCachedReservationsPage>>["data"];
  nextOffset: number | null;
  count?: number | null;
};

const parseBoolean = (value: string | null): boolean => {
  if (!value) return false;
  return ["1", "true", "yes"].includes(value.toLowerCase());
};

export async function GET(request: NextRequest) {
  try {
    await requireFeature(request, "reservations");
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const offsetParam = url.searchParams.get("offset");
  const includeCount = parseBoolean(url.searchParams.get("includeCount"));

  const limit = limitParam ? Number(limitParam) : undefined;
  const offset = offsetParam ? Number(offsetParam) : undefined;

  if ((limitParam && Number.isNaN(Number(limitParam))) || (offsetParam && Number.isNaN(Number(offsetParam)))) {
    return NextResponse.json(
      { message: "limit and offset must be numbers" },
      { status: 400 }
    );
  }

  try {
    const normalized = clampReservationPageParams({ limit, offset });
    const page = await getCachedReservationsPage(normalized);

    let count: number | null | undefined;
    if (includeCount) {
      count = await getCachedReservationsCount();
    }

    const body: ReservationsApiResponse = {
      data: page.data,
      nextOffset: page.nextOffset,
      count,
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load reservations";
    return NextResponse.json({ message }, { status: 500 });
  }
}
