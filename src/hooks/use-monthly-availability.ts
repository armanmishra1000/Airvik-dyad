"use client";

import * as React from "react";

import type { RoomTypeAvailability } from "@/data/types";
import { getMonthlyAvailability } from "@/lib/api";

export const formatMonthStart = (value: Date): string => {
  const normalized = new Date(value.getFullYear(), value.getMonth(), 1);
  return normalized.toISOString().split("T")[0];
};

export function useMonthlyAvailability(
  month: Date,
  roomTypeIds?: string[]
) {
  const [data, setData] = React.useState<RoomTypeAvailability[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const monthStart = React.useMemo(() => formatMonthStart(month), [month]);
  const roomTypeKey = React.useMemo(() => {
    if (!roomTypeIds || roomTypeIds.length === 0) {
      return "all";
    }
    return [...roomTypeIds].sort().join(",");
  }, [roomTypeIds]);

  React.useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);
    setError(null);

    getMonthlyAvailability(monthStart, roomTypeIds)
      .then((payload) => {
        if (!isSubscribed) return;
        setData(payload);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setError(err as Error);
        setData(null);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [monthStart, roomTypeKey, roomTypeIds]);

  return { data, isLoading, error };
}
