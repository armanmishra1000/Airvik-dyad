"use client";

import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/auth-context";
import { useReservationActivityLogs } from "@/hooks/use-reservation-activity-logs";
import { useCurrencyFormatter } from "@/hooks/use-currency";

interface ReservationActivityTimelineProps {
  reservationId: string;
}

const MANAGER_ROLES = new Set(["Hotel Owner", "Hotel Manager"]);

export function ReservationActivityTimeline({ reservationId }: ReservationActivityTimelineProps) {
  const { userRole } = useAuthContext();
  const canView = userRole?.name ? MANAGER_ROLES.has(userRole.name) : false;
  const { logs, isLoading, error } = useReservationActivityLogs(reservationId, canView);
  const formatCurrency = useCurrencyFormatter();

  if (!canView) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Activity Log</CardTitle>
        <CardDescription>Track recent folio updates by staff role.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading recent activity…</p>
        )}
        {!isLoading && error && (
          <p className="text-sm text-destructive">Unable to load activity right now.</p>
        )}
        {!isLoading && !error && logs.length === 0 && (
          <p className="text-sm text-muted-foreground">No activity recorded for this reservation yet.</p>
        )}
        {!isLoading && !error && logs.length > 0 && (
          <ol className="space-y-6">
            {logs.map((log) => (
              <li key={log.id} className="relative pl-6">
                <span className="absolute left-0 top-2 block h-3 w-3 rounded-full border-2 border-primary" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {log.details ?? log.action.replace(/_/g, " ")}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {log.actorRole}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.createdAt), "MMM d, yyyy • h:mm a")} · {log.actorName ?? "Unknown user"}
                  </p>
                  {typeof log.amountMinor === "number" && (
                    <p className="text-xs font-medium text-muted-foreground">
                      Amount: {formatCurrency(log.amountMinor / 100)}
                    </p>
                  )}
                  {log.metadata && typeof log.metadata === "object" && Object.keys(log.metadata).length > 0 && (
                    <pre className="mt-2 rounded bg-muted/40 p-2 text-xs text-muted-foreground">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
