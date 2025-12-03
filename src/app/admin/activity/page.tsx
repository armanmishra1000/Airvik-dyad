"use client";

import * as React from "react";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/context/auth-context";
import { useAdminActivityLogs } from "@/hooks/use-admin-activity-logs";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { PermissionGate } from "@/components/admin/permission-gate";

const SECTION_OPTIONS = [
  { label: "All sections", value: "all" },
  { label: "Reservations", value: "reservations" },
  { label: "Guests", value: "guests" },
  { label: "Rooms", value: "rooms" },
  { label: "Room Types", value: "room_types" },
  { label: "Room Categories", value: "room_categories" },
  { label: "Rate Plans", value: "rate_plans" },
  { label: "Housekeeping", value: "housekeeping" },
  { label: "Property", value: "property" },
  { label: "Roles", value: "roles" },
  { label: "Users", value: "users" },
  { label: "Amenities", value: "amenities" },
  { label: "Sticky Notes", value: "sticky_notes" },
  { label: "Posts", value: "posts" },
  { label: "Donations", value: "donations" },
  { label: "Feedback", value: "feedback" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Settings", value: "settings" },
  { label: "System", value: "system" },
] as const;

const ROLE_OPTIONS = [
  "all",
  "Hotel Owner",
  "Hotel Manager",
  "Receptionist",
  "Housekeeper",
  "Guest",
] as const;

const LIMIT_OPTIONS = [10, 25, 50, 100, 200] as const;

export default function ActivityPage() {
  const { hasFeatureAccess } = useAuthContext();
  const canView = hasFeatureAccess("activity");
  const {
    logs,
    filters,
    setFilters,
    page,
    totalPages,
    canPrevious,
    canNext,
    setPage,
    isLoading,
    error,
    refetch,
  } = useAdminActivityLogs(
    { limit: 10 },
    { enabled: canView }
  );
  const formatCurrency = useCurrencyFormatter();

  const showPagination = canView && totalPages > 1;

  const handleNextPage = () => {
    if (!canNext) return;
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (!canPrevious) return;
    setPage((prev) => prev - 1);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "search") {
      setFilters({ search: value });
      return;
    }
    if (name === "from") {
      setFilters({ from: value || undefined });
      return;
    }
    if (name === "to") {
      setFilters({ to: value || undefined });
      return;
    }
  };

  const noAccessCard = (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Only hotel owners and managers can view this page.</CardDescription>
      </CardHeader>
    </Card>
  );

  return (
    <PermissionGate feature="activity" fallback={noAccessCard}>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Filters</CardTitle>
          <CardDescription>Scope the log by section, role, action, or date range.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select
              value={filters.section}
              onValueChange={(value) => setFilters({ section: value as typeof filters.section })}
            >
              <SelectTrigger id="section">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {SECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="actorRole">Role</Label>
            <Select
              value={filters.actorRole}
              onValueChange={(value) => setFilters({ actorRole: value })}
            >
              <SelectTrigger id="actorRole">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>{role === "all" ? "All roles" : role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="action">Action contains</Label>
            <Input
              id="action"
              name="action"
              placeholder="e.g. reservation_created"
              value={filters.action === "all" ? "" : filters.action}
              onChange={(event) => setFilters({ action: event.target.value || "all" })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              name="from"
              type="date"
              value={filters.from ?? ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              name="to"
              type="date"
              value={filters.to ?? ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              name="search"
              placeholder="Search message, entity, or actor"
              value={filters.search ?? ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Limit</Label>
            <Select
              value={String(filters.limit)}
              onValueChange={(value) => setFilters({ limit: Number(value) })}
            >
              <SelectTrigger id="limit">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((limit) => (
                  <SelectItem key={limit} value={String(limit)}>{limit} entries</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setFilters({
              section: "all",
              actorRole: "all",
              action: "all",
              from: undefined,
              to: undefined,
              search: "",
              limit: filters.limit,
            })}
            >
              Reset
            </Button>
            <Button type="button" onClick={refetch} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Showing {logs.length} entr{logs.length === 1 ? "y" : "ies"} {filters.section !== "all" && `for ${filters.section.replace(/_/g, " ")}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Loading activity…</p>}
          {!isLoading && error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}
          {!isLoading && !error && logs.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity found for the selected filters.</p>
          )}
          {!isLoading && !error && logs.length > 0 && (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{log.details ?? log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")} • {log.actorName ?? "Unknown user"} ({log.actorRole})
                      </p>
                      {log.entityLabel && (
                        <p className="text-xs text-muted-foreground">Entity: {log.entityLabel}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">{log.section.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {log.entityType && <span>Type: {log.entityType}</span>}
                    {typeof log.amountMinor === "number" && (
                      <span>Amount: {formatCurrency(log.amountMinor / 100)}</span>
                    )}
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="mt-3 overflow-x-auto rounded bg-muted/30 p-3 text-xs text-muted-foreground">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {showPagination && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canPrevious || isLoading}
                    onClick={handlePreviousPage}
                  >
                    Previous
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canNext || isLoading}
                    onClick={handleNextPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGate>
  );
}
