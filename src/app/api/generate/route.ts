import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRequestSchema } from "@/lib/ai/schema";
import { generateEmail } from "@/lib/ai/generate";
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
      return NextResponse.json({ error: "Please log in to generate an email." }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI is not connected yet. Add an AI_API_KEY to enable generation." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsedRequest = generateRequestSchema.parse(body);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    await checkAndIncrementUsage(supabase, user.id, profile?.plan ?? "free");

    let company = null;
    const companyId = parsedRequest.companyId ?? profile?.active_company_id ?? null;
    if (companyId) {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .eq("user_id", user.id)
        .maybeSingle();
      company = data;
    }

    const { structured, quality, wasRewritten } = await generateEmail({
      request: parsedRequest,
      profile: profile ?? null,
      company,
    });

    const { data: saved, error: insertError } = await supabase
      .from("email_generations")
      .insert({
        user_id: user.id,
        company_id: company?.id ?? null,
        prompt: parsedRequest.prompt,
        intent: structured.intent,
        recipient_type: structured.recipient_type,
        objective: structured.objective,
        tone: structured.tone,
        language: structured.language,
        length: parsedRequest.length,
        mode: parsedRequest.mode ?? null,
        subject: structured.subject_options[0] ?? "",
        subject_options: structured.subject_options,
        body: structured.email_body,
        structured_output: structured,
        quality_score: quality.overall,
        quality_breakdown: { ...quality.breakdown },
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("[generate] failed to persist generation", insertError);
    }

    return NextResponse.json({
      id: saved?.id ?? null,
      structured,
      quality,
      wasRewritten,
    });
  } catch (error) {
    return toSafeErrorResponse(error);
  }
}
