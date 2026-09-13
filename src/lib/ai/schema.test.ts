import { describe, expect, it } from "vitest";
import { structuredEmailSchema, generateRequestSchema, quickActionRequestSchema } from "./schema";

describe("structuredEmailSchema", () => {
  it("accepts a valid structured output", () => {
    const result = structuredEmailSchema.safeParse({
      intent: "partnership",
      recipient_type: "company",
      objective: "become reseller partner",
      tone: "professional_persuasive",
      language: "english",
      email_length: "standard",
      hook: "",
      context: "",
      value_proposition: "",
      cta: "Let me know if you're open to a quick call.",
      subject_options: ["Partnership inquiry", "Becoming an Adobe reseller partner"],
      email_body: "Hi [Name],\n\nWe'd like to explore becoming a reseller partner.",
      personalization_fields: ["[Name]"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects output missing required fields", () => {
    const result = structuredEmailSchema.safeParse({ intent: "sales" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 4 subject options", () => {
    const result = structuredEmailSchema.safeParse({
      intent: "sales",
      recipient_type: "prospect",
      objective: "get reply",
      tone: "professional",
      language: "english",
      email_length: "short",
      cta: "Reply if interested.",
      subject_options: ["a", "b", "c", "d", "e"],
      email_body: "Body",
      personalization_fields: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("generateRequestSchema", () => {
  it("rejects prompts shorter than 3 characters", () => {
    const result = generateRequestSchema.safeParse({ prompt: "hi" });
    expect(result.success).toBe(false);
  });

  it("defaults length to standard and language to auto", () => {
    const result = generateRequestSchema.parse({ prompt: "Ask a supplier for their best quotation" });
    expect(result.length).toBe("standard");
    expect(result.language).toBe("auto");
  });
});

describe("quickActionRequestSchema", () => {
  it("rejects unknown quick actions", () => {
    const result = quickActionRequestSchema.safeParse({ action: "delete_everything", body: "hi" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid rewrite request", () => {
    const result = quickActionRequestSchema.safeParse({ action: "rewrite", body: "Hello there" });
    expect(result.success).toBe(true);
  });
});
