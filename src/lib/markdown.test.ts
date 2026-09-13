import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "./markdown";

describe("renderEmailHtml", () => {
  it("escapes raw HTML so it can never inject markup", () => {
    const html = renderEmailHtml("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders bold, italic and links", () => {
    const html = renderEmailHtml("**bold** and *italic* and [link](https://example.com)");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain('href="https://example.com"');
  });

  it("renders a bullet list block as <ul>", () => {
    const html = renderEmailHtml("- first\n- second");
    expect(html).toContain("<ul");
    expect(html).toContain("<li>first</li>");
    expect(html).toContain("<li>second</li>");
  });
});
