import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { DEFAULT_CURRENCY } from "@/lib/currency";

export async function getPropertyCurrency(): Promise<string> {
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from("properties").select("currency").limit(1).maybeSingle();
    return data?.currency ?? DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}
