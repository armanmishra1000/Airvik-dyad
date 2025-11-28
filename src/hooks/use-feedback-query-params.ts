"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { FeedbackFilters } from "@/data/types";

export function useFeedbackQueryParams() {
  const rawSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = React.useMemo(
    () => rawSearchParams ?? new URLSearchParams(),
    [rawSearchParams]
  );

  const params = React.useMemo<FeedbackFilters>(() => {
    const paramRecord: FeedbackFilters = {};
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const roomOrFacility = searchParams.get("roomOrFacility");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (type) paramRecord.type = type as FeedbackFilters["type"];
    if (status) paramRecord.status = status as FeedbackFilters["status"];
    if (search) paramRecord.search = search;
    if (roomOrFacility) paramRecord.roomOrFacility = roomOrFacility;
    if (startDate) paramRecord.startDate = startDate;
    if (endDate) paramRecord.endDate = endDate;

    return paramRecord;
  }, [searchParams]);

  const updateParams = React.useCallback(
    (updates: Partial<FeedbackFilters>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  return { params, updateParams };
}
