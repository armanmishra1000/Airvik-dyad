"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User, Role, Permission } from "@/data/types";

type ProfileWithRole = {
  id: string;
  name: string | null;
  role_id: string;
  roles: Role | null;
};
import { getUserProfile } from "@/lib/api";

/**
 * Exposes authentication state, the current application user and role, loading status, and a permission-checking helper.
 *
 * @returns An object with the following properties:
 * - `authUser` — the Supabase `AuthUser` for the signed-in session, or `null` if not signed in.
 * - `currentUser` — the application `User` (id, name, email, roleId) derived from the profile, or `null` if not available.
 * - `userRole` — the current `Role` object with permissions, or `null` if not available.
 * - `isLoading` — `true` while authentication or profile fetching is in progress, `false` otherwise.
 * - `hasPermission` — a function that returns `true` if the current role name is `'Hotel Owner'` or the role's permissions include the supplied permission, `false` otherwise.
 */
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
      setUserRole(typedProfile.roles);
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
    if (userRole.name === 'Hotel Owner') return true;
    return userRole.permissions?.includes(permission) || false;
  };

  return { authUser, currentUser, userRole, isLoading, hasPermission };
}