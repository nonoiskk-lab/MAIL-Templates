import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsage } from "@/lib/security/rate-limit";
import { toSafeErrorResponse } from "@/lib/security/errors";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    const usage = await getUsage(supabase, user.id, profile?.plan ?? "free");
    return NextResponse.json({ ...usage, plan: profile?.plan ?? "free" });
  } catch (error) {
    return toSafeErrorResponse(error);
  }
}
