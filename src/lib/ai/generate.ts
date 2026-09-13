import { getAIProvider } from "./index";
import { structuredEmailSchema, type StructuredEmailOutput, type GenerateRequest } from "./schema";
import { MAILCRAFT_SYSTEM_PROMPT, buildGenerationUserPrompt } from "./system-prompt";
import { computeQualityScore, needsAutomaticRewrite, extractStructuredQualityInput, type QualityResult } from "./quality";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Company = Database["public"]["Tables"]["companies"]["Row"];

function parseStructuredJson(raw: string): StructuredEmailOutput {
  let candidate = raw.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidate = fenced[1];

  let json: unknown;
  try {
    json = JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("AI response was not valid JSON.");
    }
    json = JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  }

  const parsed = structuredEmailSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`AI response failed validation: ${parsed.error.message}`);
  }
  return parsed.data;
}

export interface GenerationResult {
  structured: StructuredEmailOutput;
  quality: QualityResult;
  wasRewritten: boolean;
}

export async function generateEmail({
  request,
  profile,
  company,
}: {
  request: GenerateRequest;
  profile: Profile | null;
  company: Company | null;
}): Promise<GenerationResult> {
  const provider = getAIProvider();
  const userPrompt = buildGenerationUserPrompt({ request, profile, company });

  const raw = await provider.complete({
    system: MAILCRAFT_SYSTEM_PROMPT,
    prompt: userPrompt,
    json: true,
    temperature: 0.65,
  });

  let structured = parseStructuredJson(raw);
  let quality = computeQualityScore(extractStructuredQualityInput(structured));
  let wasRewritten = false;

  // AI self-review pass (spec §19): if the deterministic quality checks
  // fail, ask the model to revise once with the specific issues found.
  if (needsAutomaticRewrite(quality) && quality.issues.length > 0) {
    const revisionPrompt = `${userPrompt}\n\nYou previously drafted this email:\n${JSON.stringify(structured)}\n\nA quality review found these issues: ${quality.issues.join("; ")}. Revise the email to fix them while keeping the same intent, facts, and placeholders. Respond with the same JSON shape only.`;

    try {
      const revisedRaw = await provider.complete({
        system: MAILCRAFT_SYSTEM_PROMPT,
        prompt: revisionPrompt,
        json: true,
        temperature: 0.5,
      });
      const revised = parseStructuredJson(revisedRaw);
      const revisedQuality = computeQualityScore(extractStructuredQualityInput(revised));
      if (revisedQuality.overall >= quality.overall) {
        structured = revised;
        quality = revisedQuality;
        wasRewritten = true;
      }
    } catch {
      // Keep the original draft if the revision pass fails.
    }
  }

  return { structured, quality, wasRewritten };
}
