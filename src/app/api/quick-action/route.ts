import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { quickActionRequestSchema } from "@/lib/ai/schema";
import { runQuickAction } from "@/lib/ai/quick-action";
import { checkAndIncrementUsage } from "@/lib/security/rate-limit";
import { toSafeErrorResponse } from "@/lib/security/errors";
import { isAIConfigured } from "@/lib/ai";
import { isSameOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to edit this email." }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI is not connected yet. Add an AI_API_KEY to enable this action." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = quickActionRequestSchema.parse(body);

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    await checkAndIncrementUsage(supabase, user.id, profile?.plan ?? "free");

    const result = await runQuickAction({
      action: parsed.action,
      subject: parsed.subject,
      body: parsed.body,
      targetLanguage: parsed.targetLanguage,
    });

    return NextResponse.json(result);
  } catch (error) {
    return toSafeErrorResponse(error);
  }
}
