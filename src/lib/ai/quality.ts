import type { StructuredEmailOutput } from "./schema";

/**
 * Deterministic quality scoring (spec §18-19). Every sub-score is computed
 * from the actual text — nothing here is a fabricated number.
 */

const ROBOTIC_PHRASES = [
  "i hope this email finds you well",
  "i am writing to express my keen interest",
  "in today's fast-paced world",
  "i would like to take this opportunity",
  "please do not hesitate to contact me",
  "i am writing to inquire",
  "i trust this email finds you well",
  "in this day and age",
  "leverage synergies",
  "circle back",
  "touch base",
  "reaching out",
  "game changer",
  "cutting-edge solutions",
];

const SPAM_WORDS = ["urgent", "guaranteed", "act now", "free money", "risk-free", "click here"];

export interface QualityBreakdown {
  clarity: number;
  professionalism: number;
  persuasiveness: number;
  humanQuality: number;
  ctaStrength: number;
  grammar: number;
  personalization: number;
}

export interface QualityResult {
  overall: number;
  breakdown: QualityBreakdown;
  issues: string[];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function computeQualityScore(output: {
  subject: string;
  body: string;
  cta: string;
  personalizationFields: string[];
}): QualityResult {
  const { subject, body, cta, personalizationFields } = output;
  const issues: string[] = [];
  const lowerBody = body.toLowerCase();
  const sentences = splitSentences(body);
  const words = body.split(/\s+/).filter(Boolean);

  // --- Human quality: penalize robotic clichés ---
  let roboticHits = 0;
  for (const phrase of ROBOTIC_PHRASES) {
    if (lowerBody.includes(phrase)) roboticHits += 1;
  }
  const humanQuality = clamp(100 - roboticHits * 20);
  if (roboticHits > 0) {
    issues.push(`Contains ${roboticHits} generic AI phrase${roboticHits > 1 ? "s" : ""}.`);
  }

  // --- Professionalism: excessive exclamation / all-caps / spam words ---
  const exclamations = (body.match(/!/g) ?? []).length;
  const allCapsWords = words.filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  const spamHits = SPAM_WORDS.filter((w) => lowerBody.includes(w)).length;
  let professionalism = 100 - exclamations * 8 - allCapsWords * 10 - spamHits * 15;
  professionalism = clamp(professionalism);
  if (spamHits > 0) issues.push("Contains spam-like language.");
  if (exclamations > 2) issues.push("Too many exclamation marks for a business email.");

  // --- Clarity: average sentence length (too long hurts clarity) ---
  const avgSentenceLength = sentences.length
    ? words.length / sentences.length
    : words.length;
  let clarity = 100;
  if (avgSentenceLength > 28) clarity -= 30;
  else if (avgSentenceLength > 22) clarity -= 15;
  if (words.length < 20) clarity -= 10;
  clarity = clamp(clarity);
  if (avgSentenceLength > 28) issues.push("Sentences are too long on average — split them up.");

  // --- CTA strength ---
  const ctaVerbs = ["reply", "confirm", "schedule", "call", "book", "let me know", "share", "send", "review", "approve", "join", "connect"];
  const hasCtaVerb = ctaVerbs.some((v) => cta.toLowerCase().includes(v) || lowerBody.includes(v));
  let ctaStrength = cta.trim().length > 0 ? 70 : 30;
  if (hasCtaVerb) ctaStrength += 25;
  ctaStrength = clamp(ctaStrength);
  if (ctaStrength < 60) issues.push("The call-to-action could be more specific and actionable.");

  // --- Grammar heuristics (lightweight, real checks) ---
  const doubleSpaces = (body.match(/ {2,}/g) ?? []).length;
  const repeatedWords = (body.match(/\b(\w+)\s+\1\b/gi) ?? []).length;
  const startsLower = sentences.filter((s) => /^[a-z]/.test(s)).length;
  let grammar = 100 - doubleSpaces * 5 - repeatedWords * 15 - startsLower * 10;
  grammar = clamp(grammar);
  if (repeatedWords > 0) issues.push("Repeated consecutive words detected.");

  // --- Persuasiveness: subject relevance + presence of a reason/benefit ---
  const subjectWords = subject.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const overlap = subjectWords.filter((w) => lowerBody.includes(w)).length;
  let persuasiveness = subject.trim().length > 0 ? 60 : 30;
  persuasiveness += Math.min(overlap * 8, 24);
  persuasiveness += ctaStrength > 70 ? 10 : 0;
  persuasiveness = clamp(persuasiveness);

  // --- Personalization: placeholders used deliberately, not overused ---
  const placeholderCount = (body.match(/\[[^\]]+\]/g) ?? []).length;
  let personalization = 100;
  if (placeholderCount === 0 && personalizationFields.length === 0) {
    personalization = 90; // fully personalized already
  } else if (placeholderCount > 6) {
    personalization = 55;
    issues.push("Many placeholders remain — fill them in before sending.");
  } else {
    personalization = 80;
  }

  const breakdown: QualityBreakdown = {
    clarity,
    professionalism,
    persuasiveness,
    humanQuality,
    ctaStrength,
    grammar,
    personalization,
  };

  const overall = Math.round(
    (clarity + professionalism + persuasiveness + humanQuality + ctaStrength + grammar + personalization) / 7,
  );

  return { overall, breakdown, issues };
}

export function needsAutomaticRewrite(result: QualityResult) {
  return result.overall < 70 || result.breakdown.humanQuality < 60;
}

export function extractStructuredQualityInput(structured: StructuredEmailOutput) {
  return {
    subject: structured.subject_options[0] ?? "",
    body: structured.email_body,
    cta: structured.cta,
    personalizationFields: structured.personalization_fields,
  };
}
