import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
// import type { Database } from "@/lib/types/supabase";

type BrowserSupabaseClient = SupabaseClient;

let cachedClient: BrowserSupabaseClient | undefined;

function getBrowserSupabaseConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  return { url, anonKey };
}

function createBrowserSupabaseClient(): BrowserSupabaseClient {
  if (!cachedClient) {
    const { url, anonKey } = getBrowserSupabaseConfig();
    cachedClient = createBrowserClient(url, anonKey);
  }
  return cachedClient;
}

export const supabase: BrowserSupabaseClient = new Proxy(
  {} as BrowserSupabaseClient,
  {
    get(_target, prop) {
      // Prevent some frameworks from treating this object as a Promise.
      if (prop === "then") {
        return undefined;
      }

      const client = createBrowserSupabaseClient();
      const key = prop as keyof BrowserSupabaseClient;
      const value = client[key] as unknown;

      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(client);
      }

      return value;
    },
  }
);