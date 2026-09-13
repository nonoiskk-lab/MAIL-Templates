import { describe, expect, it } from "vitest";
import { validateAttachment, MAX_ATTACHMENT_SIZE_BYTES } from "./file-validation";

describe("validateAttachment", () => {
  it("accepts a valid PDF", () => {
    const result = validateAttachment({ name: "quote.pdf", type: "application/pdf", size: 1024 });
    expect(result.valid).toBe(true);
  });

  it("rejects files over the size limit", () => {
    const result = validateAttachment({
      name: "big.pdf",
      type: "application/pdf",
      size: MAX_ATTACHMENT_SIZE_BYTES + 1,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects disallowed file types", () => {
    const result = validateAttachment({ name: "script.exe", type: "application/x-msdownload", size: 100 });
    expect(result.valid).toBe(false);
  });

  it("rejects a mismatched extension for an allowed type", () => {
    const result = validateAttachment({ name: "file.exe", type: "application/pdf", size: 100 });
    expect(result.valid).toBe(false);
  });
});
