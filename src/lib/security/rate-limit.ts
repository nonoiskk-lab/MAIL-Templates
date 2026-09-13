import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Configurable per-plan daily generation limits (spec §48). Values are read
 * from the environment so an operator can tune them without a redeploy.
 */
const DEFAULT_LIMITS: Record<string, number> = {
  free: Number(process.env.FREE_DAILY_GENERATION_LIMIT ?? 10),
  pro: Number(process.env.PRO_DAILY_GENERATION_LIMIT ?? 200),
  business: Number(process.env.BUSINESS_DAILY_GENERATION_LIMIT ?? 1000),
};

export class RateLimitExceededError extends Error {
  constructor(public readonly limit: number) {
    super("You've reached your current usage limit.");
    this.name = "RateLimitExceededError";
  }
}

export async function checkAndIncrementUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  plan: string,
) {
  const limit = DEFAULT_LIMITS[plan] ?? DEFAULT_LIMITS.free;
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("usage_daily")
    .select("generations_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  const currentCount = existing?.generations_count ?? 0;
  if (currentCount >= limit) {
    throw new RateLimitExceededError(limit);
  }

  await supabase
    .from("usage_daily")
    .upsert(
      { user_id: userId, usage_date: today, generations_count: currentCount + 1 },
      { onConflict: "user_id,usage_date" },
    );

  return { used: currentCount + 1, limit };
}

export async function getUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  plan: string,
) {
  const limit = DEFAULT_LIMITS[plan] ?? DEFAULT_LIMITS.free;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("usage_daily")
    .select("generations_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  return { used: data?.generations_count ?? 0, limit };
}
