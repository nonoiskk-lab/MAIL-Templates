import type { Database } from "@/types/database";
import type { GenerateRequest } from "./schema";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Company = Database["public"]["Tables"]["companies"]["Row"];

/**
 * Core production system prompt (spec §60). Kept as one constant so the
 * model's operating rules never drift between call sites.
 */
export const MAILCRAFT_SYSTEM_PROMPT = `You are MailCraft AI, an expert professional email writer, business communication strategist, sales copywriter and executive communication specialist.

Your task is to understand the user's actual communication objective before writing.

Do not simply translate or expand the user's sentence.

Determine:
1. Intent
2. Recipient
3. Objective
4. Context
5. Tone
6. Desired action
7. Appropriate email structure

Use available user profile and company Brand Brain context when relevant.

Never invent facts. Never fabricate achievements, claims, prices, relationships, certifications, dates, names, order numbers or company information. If information is missing, use a clearly bracketed placeholder such as [Company Name], [Amount], [Date], or [Order Number].

Write naturally. Avoid robotic AI language, generic filler ("I hope this email finds you well", "I am writing to express my keen interest", "in today's fast-paced world", "I would like to take this opportunity", "please do not hesitate to contact me") unless genuinely appropriate, and avoid unnecessary corporate jargon or exaggerated claims. Keep the email concise and useful.

Create a strong, specific, non-clickbait subject line — never use hype like "URGENT!!!" or "100% Guaranteed!!!".

Use one primary call to action. Optimize for clarity, credibility and response probability.

The final email must be immediately usable by a real professional, formatted with a greeting, body paragraphs, and a sign-off using the sender's signature when provided.

You must respond with ONLY a single valid JSON object — no markdown fences, no commentary — matching exactly this shape:
{
  "intent": string,
  "recipient_type": string,
  "objective": string,
  "tone": string,
  "language": string,
  "email_length": string,
  "hook": string,
  "context": string,
  "value_proposition": string,
  "cta": string,
  "subject_options": string[] (2-3 options, most recommended first),
  "email_body": string (the full email body including greeting and sign-off, plain text with blank lines between paragraphs),
  "personalization_fields": string[] (list of placeholder tokens used, e.g. ["[Company Name]", "[Amount]"])
}`;

function describeLength(length: string) {
  switch (length) {
    case "short":
      return "Short (roughly 60-100 words). Do not pad it out.";
    case "detailed":
      return "Detailed (roughly 180-300 words). Only use the extra length if the objective genuinely needs it.";
    default:
      return "Standard (roughly 100-180 words).";
  }
}

function describeLanguage(language: string) {
  switch (language) {
    case "hindi":
      return "Write the email in Hindi.";
    case "hinglish":
      return "Write the email in natural, professional Hinglish (Hindi-English mix), the way an Indian business professional would actually write.";
    case "english":
      return "Write the email in English.";
    default:
      return "Detect the language and register from the user's request (Hindi, Hinglish, or English) and reply in that same language, defaulting to professional English if unclear.";
  }
}

function describeMode(mode?: string) {
  if (!mode) return "Choose whichever tone/mode best fits the request.";
  const labels: Record<string, string> = {
    professional: "Professional — clean, neutral business communication.",
    sales: "Sales — conversion-oriented, benefit-led.",
    persuasive: "Persuasive — strong, credible value proposition.",
    executive: "Executive — short, direct, no fluff.",
    friendly: "Friendly — warm and approachable, still professional.",
    cold_outreach: "Cold outreach — personalized first contact, low-pressure ask.",
    follow_up: "Follow-up — polite but action-oriented.",
    formal: "Formal — suitable for official/institutional communication.",
    government: "Government — respectful, structured, precise.",
    job_application: "Job application — professional career communication.",
  };
  return labels[mode] ?? "Choose whichever tone/mode best fits the request.";
}

/**
 * Builds the per-request user message. Context priority (spec §62):
 * current request > active company (Brand Brain) > user profile > saved templates.
 * The current request always wins on conflicting details.
 */
export function buildGenerationUserPrompt({
  request,
  profile,
  company,
}: {
  request: GenerateRequest;
  profile: Profile | null;
  company: Company | null;
}) {
  const sections: string[] = [];

  sections.push(`USER REQUEST (highest priority — always wins on conflicts):\n"${request.prompt}"`);

  sections.push(`Requested email length: ${describeLength(request.length)}`);
  sections.push(`Language instruction: ${describeLanguage(request.language)}`);
  sections.push(`Tone/mode guidance: ${describeMode(request.mode)}`);

  if (company) {
    const companyLines = [
      company.name && `Company name: ${company.name}`,
      company.industry && `Industry: ${company.industry}`,
      company.description && `Description: ${company.description}`,
      company.products && `Products: ${company.products}`,
      company.services && `Services: ${company.services}`,
      company.usp && `USP: ${company.usp}`,
      company.target_audience && `Target audience: ${company.target_audience}`,
      company.brand_voice && `Brand voice: ${company.brand_voice}`,
      company.achievements && `Achievements (only mention if directly relevant, never exaggerate): ${company.achievements}`,
      company.differentiators && `Key differentiators: ${company.differentiators}`,
      company.website && `Website: ${company.website}`,
    ].filter(Boolean);
    if (companyLines.length) {
      sections.push(`ACTIVE COMPANY / BRAND BRAIN CONTEXT (use only what is relevant; never invent beyond this):\n${companyLines.join("\n")}`);
    }
  }

  if (profile) {
    const profileLines = [
      profile.full_name && `Name: ${profile.full_name}`,
      profile.designation && `Designation: ${profile.designation}`,
      profile.phone && `Phone: ${profile.phone}`,
      profile.email && `Email: ${profile.email}`,
      profile.website && `Website: ${profile.website}`,
      profile.linkedin && `LinkedIn: ${profile.linkedin}`,
    ].filter(Boolean);
    if (profileLines.length) {
      sections.push(`SENDER PROFILE (use for the signature and first-person details):\n${profileLines.join("\n")}`);
    }
    if (profile.signature) {
      sections.push(`Use this exact sign-off/signature block at the end of the email:\n${profile.signature}`);
    } else {
      sections.push(
        `No saved signature — sign off with the sender's name if known, otherwise the placeholder [Your Name].`,
      );
    }
  } else {
    sections.push("No sender profile saved — sign off with the placeholder [Your Name].");
  }

  sections.push(
    "Any fact not present above or in the user request (recipient name, prices, dates, order numbers, certifications, specific claims) must be written as a bracketed placeholder, never invented.",
  );

  return sections.join("\n\n");
}
