"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User, Role, Permission } from "@/data/types";
import { getUserProfile } from "@/lib/api";

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
      
      setAuthUser(user);
      // @ts-ignore
      setCurrentUser({ id: profile.id, name: profile.name, email: user.email, roleId: profile.role_id });
      // @ts-ignore
      setUserRole(profile.roles);
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