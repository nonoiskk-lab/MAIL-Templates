"use client";

import { useRef } from "react";
import { Bold, Italic, List, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  value: string,
  onChange: (value: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || "text";
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
  });
}

export function EmailEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyBullets = () => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "List item";
    const bulleted = selected
      .split("\n")
      .map((line) => (line.trim() ? `- ${line.replace(/^-\s*/, "")}` : line))
      .join("\n");
    const next = value.slice(0, start) + bulleted + value.slice(end);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Email body</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Bold"
            onClick={() => ref.current && wrapSelection(ref.current, "**", "**", value, onChange)}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Italic"
            onClick={() => ref.current && wrapSelection(ref.current, "*", "*", value, onChange)}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" title="Bullet list" onClick={applyBullets}>
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Insert link"
            onClick={() =>
              ref.current && wrapSelection(ref.current, "[", "](https://)", value, onChange)
            }
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="font-[450] leading-relaxed"
      />
      <p className="text-xs text-muted-foreground">
        Use **bold**, *italic*, “- ” for bullets, and [text](https://link) for links.
      </p>
    </div>
  );
}
