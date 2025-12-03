"use client";

import * as React from "react";

import type { Permission } from "@/data/types";
import { useAuthContext } from "@/context/auth-context";
import { getPermissionsForFeature, type PermissionFeature } from "@/lib/permissions/map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type PermissionGateProps = {
  feature?: PermissionFeature | PermissionFeature[];
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGate({
  feature,
  permissions = [],
  requireAll = false,
  fallback,
  children,
}: PermissionGateProps) {
  const { isLoading, hasPermission, hasAnyPermission } = useAuthContext();

  const featurePermissions = React.useMemo(() => {
    if (!feature) {
      return [] as Permission[];
    }

    const features = Array.isArray(feature) ? feature : [feature];
    return features.flatMap((entry) => getPermissionsForFeature(entry) as Permission[]);
  }, [feature]);

  const requiredPermissions = React.useMemo(() => {
    const combined = [...featurePermissions, ...permissions];
    return combined.filter((permission, index) => combined.indexOf(permission) === index);
  }, [featurePermissions, permissions]);

  const isAllowed = React.useMemo(() => {
    if (requiredPermissions.length === 0) {
      return true;
    }

    if (requireAll) {
      return requiredPermissions.every((permission) => hasPermission(permission));
    }

    return hasAnyPermission(requiredPermissions);
  }, [requiredPermissions, requireAll, hasAnyPermission, hasPermission]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-muted-foreground">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking permissions…
        </span>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <>
        {fallback ?? (
          <Card className="border-dashed border-border/40 bg-card/80 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Access restricted</CardTitle>
              <CardDescription>
                Your current role doesn&apos;t include the permissions required to view this section.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Please contact an administrator if you believe you should have access.
            </CardContent>
          </Card>
        )}
      </>
    );
  }

  return <>{children}</>;
}
