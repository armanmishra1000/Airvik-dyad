"use client";

import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

let pendingIntentionalSignOut = false;

export async function signOutUser(): Promise<void> {
  pendingIntentionalSignOut = true;
  await supabase.auth.signOut();
}

interface UserMetadataWithRole {
  role_name?: string;
}

type SessionContextType = {
  session: Session | null;
  isLoading: boolean;
  roleName: string | null;
};

const SessionContext = React.createContext<SessionContextType | undefined>(
  undefined
);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [roleName, setRoleName] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      const metaRole =
        (data.session?.user?.user_metadata as UserMetadataWithRole | undefined)
          ?.role_name ?? null;
      setRoleName(typeof metaRole === "string" ? metaRole : null);
      setIsLoading(false);
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSession(s);
        const metaRole =
          (s.user?.user_metadata as UserMetadataWithRole | undefined)
            ?.role_name ?? null;
        setRoleName(typeof metaRole === "string" ? metaRole : null);
      } else {
        if (pendingIntentionalSignOut) {
          pendingIntentionalSignOut = false;
          setSession(null);
          setRoleName(null);
        }
        // If not intentional (likely 429 on token refresh), keep existing session.
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = React.useMemo(
    () => ({ session, isLoading, roleName }),
    [session, isLoading, roleName]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be used within SessionProvider");
  return ctx;
}
