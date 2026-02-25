import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
// import type { Database } from "@/lib/types/supabase";

type BrowserSupabaseClient = SupabaseClient;

let cachedClient: BrowserSupabaseClient | undefined;

const FETCH_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status >= 500 && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Fetch failed after retries");
}

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
    cachedClient = createBrowserClient(url, anonKey, {
      global: { fetch: fetchWithRetry },
    });
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