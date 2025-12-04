import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
}

type BrowserSupabaseClient = SupabaseClient<Database, "public", "public">;

let cachedClient: BrowserSupabaseClient | undefined;

function createBrowserSupabaseClient(): BrowserSupabaseClient {
  if (!cachedClient) {
    cachedClient = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
  }
  return cachedClient;
}

export const supabase: BrowserSupabaseClient = createBrowserSupabaseClient();