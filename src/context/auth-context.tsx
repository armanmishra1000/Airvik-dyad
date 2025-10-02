"use client";

import * as React from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { User, Role, Permission } from "@/data/types";
import { useAuth } from "@/hooks/use-auth";
import { AppSkeleton } from "@/components/layout/app-skeleton";

interface AuthContextType {
  authUser: AuthUser | null;
  currentUser: User | null;
  userRole: Role | null;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // By always rendering the provider and its children, we prevent the entire
  // component tree from unmounting during authentication checks on tab focus.
  // The loading state is passed down through the context for consumers to handle.
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}