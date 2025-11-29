"use client";

import * as React from "react";

import type { ReservationActivityLog } from "@/data/types";
import { getReservationActivityLogs } from "@/lib/api";

export function useReservationActivityLogs(
  reservationId: string | null,
  enabled: boolean
) {
  const [logs, setLogs] = React.useState<ReservationActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchLogs = React.useCallback(async () => {
    if (!enabled || !reservationId) {
      setLogs([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: fetchError } = await getReservationActivityLogs(reservationId);
      if (fetchError) {
        throw new Error(fetchError.message ?? "Unable to load reservation activity logs");
      }
      setLogs(data);
      setError(null);
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Failed to load reservation activity logs");
      setError(nextError);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, reservationId]);

  React.useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return { logs, isLoading, error, refetch: fetchLogs };
}
