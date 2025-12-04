import "server-only";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import { getServerSupabaseClient } from "@/lib/server/supabase";

export async function getPropertyCurrency(): Promise<string> {
  try {
    const supabase = await getServerSupabaseClient();
    const { data } = await supabase.from("properties").select("currency").limit(1).maybeSingle();
    return data?.currency ?? DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}
