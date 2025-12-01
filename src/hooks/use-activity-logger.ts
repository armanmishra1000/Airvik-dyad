"use client";

import * as React from "react";

import type { AdminActivityLogInput } from "@/data/types";
import { logAdminActivity } from "@/lib/api";
import { useOptionalAuthContext } from "@/context/auth-context";

export function useActivityLogger() {
  const auth = useOptionalAuthContext();
  const currentUser = auth?.currentUser ?? null;
  const userRole = auth?.userRole ?? null;

  const logActivity = React.useCallback(
    async (entry: AdminActivityLogInput) => {
      if (!currentUser) {
        console.warn("Skipping activity log: no authenticated user available.");
        return;
      }
      try {
        await logAdminActivity({
          actorUserId: currentUser.id,
          actorRole: userRole?.name ?? null,
          actorName: currentUser.name ?? null,
          section: entry.section,
          entityType: entry.entityType ?? null,
          entityId: entry.entityId ?? null,
          entityLabel: entry.entityLabel ?? null,
          action: entry.action,
          details: entry.details ?? null,
          amountMinor: entry.amountMinor ?? null,
          metadata: entry.metadata ?? undefined,
        });
      } catch (error) {
        console.error("Failed to log admin activity", error);
      }
    },
    [currentUser, userRole?.name]
  );

  const withActivityLog = React.useCallback(
    async <T>(operation: () => Promise<T>, entry: AdminActivityLogInput) => {
      const result = await operation();
      await logActivity(entry);
      return result;
    },
    [logActivity]
  );

  return { logActivity, withActivityLog };
}
