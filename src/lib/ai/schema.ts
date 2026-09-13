import { z } from "zod";

export const EMAIL_MODES = [
  "professional",
  "sales",
  "persuasive",
  "executive",
  "friendly",
  "cold_outreach",
  "follow_up",
  "formal",
  "government",
  "job_application",
] as const;
export type EmailMode = (typeof EMAIL_MODES)[number];

export const EMAIL_LENGTHS = ["short", "standard", "detailed"] as const;
export type EmailLength = (typeof EMAIL_LENGTHS)[number];

export const LANGUAGES = ["auto", "english", "hindi", "hinglish"] as const;
export type Language = (typeof LANGUAGES)[number];

export const INTENTS = [
  "sales",
  "cold_outreach",
  "partnership",
  "vendor_request",
  "customer_support",
  "complaint",
  "payment_reminder",
  "payment_request",
  "follow_up",
  "job_application",
  "meeting_request",
  "proposal",
  "quotation_request",
  "negotiation",
  "escalation",
  "introduction",
  "networking",
  "thank_you",
  "apology",
  "confirmation",
  "cancellation",
  "government_communication",
  "tender_communication",
  "recruitment",
  "hospitality",
  "other",
] as const;

/**
 * Structured output contract the AI must return (spec §4).
 * Every field is validated before it ever reaches the UI (spec §59).
 */
export const structuredEmailSchema = z.object({
  intent: z.string().min(1),
  recipient_type: z.string().min(1),
  objective: z.string().min(1),
  tone: z.string().min(1),
  language: z.string().min(1),
  email_length: z.string().min(1),
  hook: z.string().default(""),
  context: z.string().default(""),
  value_proposition: z.string().default(""),
  cta: z.string().min(1),
  subject_options: z.array(z.string().min(1)).min(1).max(4),
  email_body: z.string().min(1),
  personalization_fields: z.array(z.string()).default([]),
});

export type StructuredEmailOutput = z.infer<typeof structuredEmailSchema>;

export const generateRequestSchema = z.object({
  prompt: z.string().min(3, "Tell us what you want to write.").max(2000),
  mode: z.enum(EMAIL_MODES).optional(),
  length: z.enum(EMAIL_LENGTHS).default("standard"),
  language: z.enum(LANGUAGES).default("auto"),
  companyId: z.string().uuid().nullable().optional(),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const QUICK_ACTIONS = [
  "rewrite",
  "shorten",
  "expand",
  "make_professional",
  "make_friendly",
  "make_persuasive",
  "make_human",
  "improve_cta",
  "improve_subject",
  "translate",
] as const;
export type QuickAction = (typeof QUICK_ACTIONS)[number];

export const quickActionRequestSchema = z.object({
  action: z.enum(QUICK_ACTIONS),
  subject: z.string().max(300).default(""),
  body: z.string().min(1).max(6000),
  targetLanguage: z.enum(LANGUAGES).optional(),
});
export type QuickActionRequest = z.infer<typeof quickActionRequestSchema>;
