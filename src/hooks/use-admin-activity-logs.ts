"use client";

import * as React from "react";

import type { AdminActivityLog } from "@/data/types";
import { formatActivityActor, formatActivityOutcome, formatActivityResource, formatActivitySummary } from "@/lib/activity/format";
import { getAdminActivityLogs } from "@/lib/api";

type AdminActivityFilterState = {
  actorRole: string | "all";
  actorName: string;
  action: string;
  resource: string;
  summary: string;
  outcome: string;
  from?: string;
  to?: string;
  limit: number;
};

type AdminActivityFilterUpdate = Partial<AdminActivityFilterState>;

export function useAdminActivityLogs(
  initial?: Partial<AdminActivityFilterState>,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [filters, setFilters] = React.useState<AdminActivityFilterState>({
    actorRole: "all",
    actorName: "",
    action: "",
    resource: "",
    summary: "",
    outcome: "",
    limit: 50,
    ...initial,
  });
  const [logs, setLogs] = React.useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [page, setPageState] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const setPage = React.useCallback(
    (updater: number | ((prev: number) => number)) => {
      setPageState((prev) => {
        const nextValue = typeof updater === "function" ? (updater as (value: number) => number)(prev) : updater;
        if (!Number.isFinite(nextValue)) return prev;
        return Math.max(1, Math.floor(nextValue));
      });
    },
    []
  );

  const fetchLogs = React.useCallback(async () => {
    if (!enabled) {
      setLogs([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, count, error: fetchError } = await getAdminActivityLogs({
        actorRole: filters.actorRole === "all" ? undefined : filters.actorRole,
        action: filters.action.trim().length > 0 ? filters.action.trim() : undefined,
        from: filters.from,
        to: filters.to,
        limit: filters.limit,
        page,
      });
      if (fetchError) {
        throw new Error(fetchError.message ?? "Unable to load activity logs");
      }
      setLogs(data);
      setTotalCount(typeof count === "number" ? count : data.length);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load activity logs"));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, filters.action, filters.actorRole, filters.from, filters.limit, filters.to, page]);

  React.useEffect(() => {
    if (!enabled) {
      setLogs([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    void fetchLogs();
  }, [enabled, fetchLogs, refreshKey]);

  React.useEffect(() => {
    if (!enabled) return;
    const pageSize = filters.limit > 0 ? filters.limit : 1;
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [enabled, filters.limit, page, setPage, totalCount]);

  const filteredLogs = React.useMemo(() => {
    const actorFilter = filters.actorName.trim().toLowerCase();
    const resourceFilter = filters.resource.trim().toLowerCase();
    const summaryFilter = filters.summary.trim().toLowerCase();
    const outcomeFilter = filters.outcome.trim().toLowerCase();

    if (!actorFilter && !resourceFilter && !summaryFilter && !outcomeFilter) {
      return logs;
    }

    return logs.filter((log) => {
      if (actorFilter) {
        const actorValue = formatActivityActor(log).toLowerCase();
        if (!actorValue.includes(actorFilter)) {
          return false;
        }
      }

      if (resourceFilter) {
        const resourceValue = formatActivityResource(log).toLowerCase();
        if (!resourceValue.includes(resourceFilter)) {
          return false;
        }
      }

      if (summaryFilter) {
        const summaryValue = formatActivitySummary(log).toLowerCase();
        if (!summaryValue.includes(summaryFilter)) {
          return false;
        }
      }

      if (outcomeFilter) {
        const outcomeValue = formatActivityOutcome(log).toLowerCase();
        if (!outcomeValue.includes(outcomeFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [filters.actorName, filters.outcome, filters.resource, filters.summary, logs]);

  const updateFilters = React.useCallback((updates: AdminActivityFilterUpdate) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  }, [setPage]);

  const refetch = React.useCallback(() => {
    if (!enabled) return;
    setRefreshKey((key) => key + 1);
  }, [enabled]);

  const pageSize = filters.limit > 0 ? filters.limit : 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return {
    logs: filteredLogs,
    filters,
    setFilters: updateFilters,
    page,
    pageSize,
    totalCount,
    totalPages,
    canPrevious,
    canNext,
    setPage,
    isLoading,
    error,
    refetch,
  };
}
