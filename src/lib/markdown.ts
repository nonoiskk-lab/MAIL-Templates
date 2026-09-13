/**
 * Minimal, safe markdown-ish renderer for the email editor/preview.
 * Supports **bold**, *italic*, "- " bullet lists, [text](url) links and
 * blank-line paragraphs. User/AI text is HTML-escaped first, so the only
 * markup that reaches the DOM is what this function emits.
 */
function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(text: string) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>',
  );
  return out;
}

export function renderEmailHtml(body: string): string {
  const blocks = body.split(/\n{2,}/);
  const html = blocks
    .map((block) => {
      const lines = block.split("\n").filter((l) => l.trim().length > 0);
      const isList = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
      if (isList) {
        const items = lines
          .map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul class="list-disc pl-5 space-y-1">${items}</ul>`;
      }
      return `<p>${lines.map(inline).join("<br />")}</p>`;
    })
    .join("");
  return html;
}
