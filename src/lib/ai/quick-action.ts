import { getAIProvider } from "./index";
import type { QuickAction } from "./schema";
import { MAILCRAFT_SYSTEM_PROMPT } from "./system-prompt";
import { z } from "zod";

const quickActionResultSchema = z.object({
  subject: z.string().default(""),
  body: z.string().min(1),
});
export type QuickActionResult = z.infer<typeof quickActionResultSchema>;

const INSTRUCTIONS: Record<QuickAction, string> = {
  rewrite: "Rewrite this email with fresh wording while keeping the same meaning, facts and placeholders.",
  shorten: "Shorten this email to roughly 60-100 words without losing the core ask. Keep the CTA.",
  expand: "Expand this email with more relevant context and detail, staying under 300 words. Do not invent new facts — only elaborate on what is already there.",
  make_professional: "Rewrite this email to sound more professional and polished, removing any casual language.",
  make_friendly: "Rewrite this email to sound warmer and more approachable while staying professional.",
  make_persuasive: "Rewrite this email to be more persuasive: sharpen the value proposition and the call to action.",
  make_human: "Rewrite this email to remove robotic AI phrasing, generic buzzwords and repetitive wording. Use natural sentence variation so it reads like a capable human professional wrote it, without sounding overly enthusiastic.",
  improve_cta: "Rewrite only the call-to-action so it is clearer, more specific and easier to act on. Keep the rest of the email the same.",
  improve_subject: "Keep the email body exactly the same, but propose a sharper, more specific, non-clickbait subject line.",
  translate: "Translate this email into the target language, preserving tone, structure and placeholders.",
};

function parseJson(raw: string): QuickActionResult {
  let candidate = raw.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidate = fenced[1];
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  const jsonSlice = firstBrace !== -1 && lastBrace !== -1 ? candidate.slice(firstBrace, lastBrace + 1) : candidate;
  const parsed = quickActionResultSchema.safeParse(JSON.parse(jsonSlice));
  if (!parsed.success) {
    throw new Error(`Quick action response failed validation: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function runQuickAction({
  action,
  subject,
  body,
  targetLanguage,
}: {
  action: QuickAction;
  subject: string;
  body: string;
  targetLanguage?: string;
}): Promise<QuickActionResult> {
  const provider = getAIProvider();
  const instruction = INSTRUCTIONS[action];
  const languageNote =
    action === "translate"
      ? `Target language: ${targetLanguage ?? "english"}.`
      : "";

  const prompt = `${instruction}\n${languageNote}\n\nCurrent subject: ${subject || "(none)"}\nCurrent body:\n${body}\n\nRespond with ONLY this JSON shape: {"subject": string, "body": string}. If the subject is unchanged, return it unchanged.`;

  const raw = await provider.complete({
    system: `${MAILCRAFT_SYSTEM_PROMPT}\n\nYou are now performing a focused edit on an existing email, not writing one from scratch. Never invent new facts, names, prices or dates that were not already present or placeholders.`,
    prompt,
    json: true,
    temperature: action === "rewrite" || action === "make_human" ? 0.7 : 0.4,
  });

  return parseJson(raw);
}
