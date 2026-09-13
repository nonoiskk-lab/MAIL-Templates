"use client";

import { useState } from "react";
import {
  Copy,
  RefreshCw,
  Minimize2,
  Maximize2,
  Languages,
  Sparkles,
  Save,
  Send,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { QuickAction } from "@/lib/ai/schema";
import { LANGUAGE_OPTIONS } from "@/lib/constants";

export function ActionBar({
  subject,
  body,
  onResult,
  onSave,
  onSend,
  busyAction,
  setBusyAction,
}: {
  subject: string;
  body: string;
  onResult: (result: { subject: string; body: string }) => void;
  onSave: () => void;
  onSend: () => void;
  busyAction: QuickAction | null;
  setBusyAction: (action: QuickAction | null) => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<"body" | "subject" | "both" | null>(null);

  async function runAction(action: QuickAction, targetLanguage?: string) {
    setBusyAction(action);
    try {
      const res = await fetch("/api/quick-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, subject, body, targetLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That action failed.");
      onResult(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't complete that action",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  function copy(text: string, kind: "body" | "subject" | "both") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <Button variant="outline" size="sm" onClick={() => copy(body, "body")}>
        {copied === "body" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied === "body" ? "Copied" : "Copy Email"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => copy(subject, "subject")}>
        {copied === "subject" ? "Copied ✓" : "Copy Subject"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => copy(`${subject}\n\n${body}`, "both")}>
        {copied === "both" ? "Copied ✓" : "Copy Subject + Email"}
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        variant="outline"
        size="sm"
        disabled={busyAction !== null}
        onClick={() => runAction("rewrite")}
      >
        <RefreshCw className={`h-4 w-4 ${busyAction === "rewrite" ? "animate-spin" : ""}`} />
        Rewrite
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={busyAction !== null}
        onClick={() => runAction("shorten")}
      >
        <Minimize2 className="h-4 w-4" />
        Shorten
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={busyAction !== null}
        onClick={() => runAction("expand")}
      >
        <Maximize2 className="h-4 w-4" />
        Expand
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={busyAction !== null}>
            <Sparkles className="h-4 w-4" />
            More
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => runAction("make_professional")}>Make Professional</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runAction("make_friendly")}>Make Friendly</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runAction("make_persuasive")}>Make Persuasive</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runAction("make_human")}>Make More Human</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => runAction("improve_cta")}>Improve CTA</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runAction("improve_subject")}>Improve Subject</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={busyAction !== null}>
            <Languages className="h-4 w-4" />
            Translate
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {LANGUAGE_OPTIONS.filter((l) => l.value !== "auto").map((lang) => (
            <DropdownMenuItem key={lang.value} onClick={() => runAction("translate", lang.value)}>
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button size="sm" onClick={onSend}>
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
