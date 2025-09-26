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

  if (auth.isLoading) {
    return <AppSkeleton />;
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}