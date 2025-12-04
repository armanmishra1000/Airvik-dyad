import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
// import type { Database } from "@/lib/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type SetAllCookies = NonNullable<CookieMethodsServer["setAll"]>;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

const resolvedSupabaseUrl = supabaseUrl as string;
const resolvedSupabaseAnonKey = supabaseAnonKey as string;

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse: NextResponse = NextResponse.next({ request });

  const supabase = await createServerClient(
    resolvedSupabaseUrl,
    resolvedSupabaseAnonKey,
    {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
      },
    },
    }
  );

  await supabase.auth.getClaims();

  return supabaseResponse;
}
