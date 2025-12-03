"use client";

import * as React from "react";
import { addMonths, startOfMonth } from "date-fns";

import type { RoomTypeAvailability } from "@/data/types";
import { getMonthlyAvailability } from "@/lib/api";

export const formatMonthStart = (value: Date): string => {
  const normalized = new Date(value.getFullYear(), value.getMonth(), 1);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = '01';
  return `${year}-${month}-${day}`;
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

export function useMultiMonthAvailability(
  startMonth: Date,
  monthCount: number,
  roomTypeIds?: string[]
) {
  const normalizedCount = React.useMemo(() => {
    if (!Number.isFinite(monthCount)) return 1;
    return Math.max(1, Math.min(12, Math.trunc(monthCount)));
  }, [monthCount]);

  const monthSequence = React.useMemo(() => {
    return Array.from({ length: normalizedCount }, (_, index) =>
      startOfMonth(addMonths(startMonth, index))
    );
  }, [startMonth, normalizedCount]);

  const monthStarts = React.useMemo(
    () => monthSequence.map((monthDate) => formatMonthStart(monthDate)),
    [monthSequence]
  );

  const roomTypeKey = React.useMemo(() => {
    if (!roomTypeIds || roomTypeIds.length === 0) {
      return "all";
    }
    return [...roomTypeIds].sort().join(",");
  }, [roomTypeIds]);

  const [dataByMonth, setDataByMonth] = React.useState<Record<string, RoomTypeAvailability[]>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);
    setError(null);
    setDataByMonth({});

    Promise.all(
      monthStarts.map((monthStart) =>
        getMonthlyAvailability(monthStart, roomTypeIds)
      )
    )
      .then((payloads) => {
        if (!isSubscribed) return;
        const nextData: Record<string, RoomTypeAvailability[]> = {};
        payloads.forEach((payload, index) => {
          nextData[monthStarts[index]] = payload;
        });
        setDataByMonth(nextData);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setError(err as Error);
        setDataByMonth({});
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [monthStarts, roomTypeKey, roomTypeIds]);

  return { dataByMonth, isLoading, error };
}
