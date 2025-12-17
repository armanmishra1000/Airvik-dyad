"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User, Role, Permission } from "@/data/types";
import { getPermissionsForFeature, type PermissionFeature } from "@/lib/permissions/map";

type ProfileWithRole = {
  id: string;
  name: string | null;
  role_id: string;
  roles: Role | null;
};
import { getUserProfile } from "@/lib/api";

const mapRole = (role: Role | null): Role | null => {
  if (!role) return null;
  const raw = role as Role & { hierarchy_level?: number };
  return {
    ...role,
    hierarchyLevel: typeof raw.hierarchyLevel === "number" ? raw.hierarchyLevel : raw.hierarchy_level ?? 0,
  };
};

export function useAuth() {
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userRole, setUserRole] = React.useState<Role | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchUserProfile = React.useCallback(async (user: AuthUser) => {
    setIsLoading(true);
    try {
      const { data: profile, error } = await getUserProfile(user.id);
      if (error) throw error;
      if (!profile) throw new Error("Profile not found");

      const typedProfile = profile as ProfileWithRole;

      setAuthUser(user);
      setCurrentUser({
        id: typedProfile.id,
        name: typedProfile.name ?? "",
        email: user.email ?? "",
        roleId: typedProfile.role_id,
      });
      setUserRole(mapRole(typedProfile.roles));
    } catch (error) {
      console.error("Failed to fetch user profile, signing out.", error);
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAuthData = () => {
    setAuthUser(null);
    setCurrentUser(null);
    setUserRole(null);
    setIsLoading(false);
  };

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        clearAuthData();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return userRole.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Iterable<Permission>): boolean => {
    for (const permission of permissions) {
      if (hasPermission(permission)) {
        return true;
      }
    }
    return false;
  };

  const hasFeatureAccess = (
    feature: PermissionFeature,
    { requireAll = false }: { requireAll?: boolean } = {}
  ): boolean => {
    const required = getPermissionsForFeature(feature);
    if (required.length === 0) {
      return true;
    }

    if (requireAll) {
      return required.every((permission) => hasPermission(permission));
    }

    return hasAnyPermission(required);
  };

  return {
    authUser,
    currentUser,
    userRole,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasFeatureAccess,
  };
}