import { describe, expect, it } from "vitest";
import { computeQualityScore, needsAutomaticRewrite } from "./quality";

describe("computeQualityScore", () => {
  it("scores a clean, human-sounding email highly", () => {
    const result = computeQualityScore({
      subject: "Quick question about your Adobe reseller program",
      body:
        "Hi [Name],\n\nWe're exploring becoming an Adobe reseller partner and wanted to check the requirements to get started.\n\nCould you share the next steps or point me to the right person on your team?\n\nBest regards,\nJordan",
      cta: "Could you share the next steps or point me to the right person on your team?",
      personalizationFields: ["[Name]"],
    });

    expect(result.overall).toBeGreaterThanOrEqual(70);
    expect(result.breakdown.humanQuality).toBe(100);
  });

  it("penalizes robotic clichés and spam language", () => {
    const result = computeQualityScore({
      subject: "URGENT!!! Guaranteed offer",
      body:
        "I hope this email finds you well. I am writing to express my keen interest in a game changer opportunity. Act now for a guaranteed, risk-free deal!!!",
      cta: "Act now",
      personalizationFields: [],
    });

    expect(result.breakdown.humanQuality).toBeLessThan(60);
    expect(result.breakdown.professionalism).toBeLessThan(70);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("flags emails that need an automatic rewrite", () => {
    const bad = computeQualityScore({
      subject: "URGENT!!!",
      body: "I hope this email finds you well. I hope this email finds you well. Act now!!! Guaranteed!!!",
      cta: "",
      personalizationFields: [],
    });
    expect(needsAutomaticRewrite(bad)).toBe(true);
  });
});
