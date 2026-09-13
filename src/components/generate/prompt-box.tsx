"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  EMAIL_MODE_OPTIONS,
  EMAIL_LENGTH_OPTIONS,
  LANGUAGE_OPTIONS,
  PROMPT_EXAMPLES,
} from "@/lib/constants";

export interface PromptSettings {
  mode: string;
  length: string;
  language: string;
}

export function PromptBox({
  prompt,
  onPromptChange,
  settings,
  onSettingsChange,
  onSubmit,
  isGenerating,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  settings: PromptSettings;
  onSettingsChange: (settings: PromptSettings) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}) {
  const [showExamples, setShowExamples] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-secondary" />
        <h2 className="text-lg font-semibold">What email do you need to write?</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Describe it naturally. Our AI will turn your idea into a professional email.
      </p>

      <Textarea
        value={prompt}
        onChange={(e) => {
          onPromptChange(e.target.value);
          setShowExamples(false);
        }}
        placeholder="e.g. I want to become an Adobe reseller partner"
        rows={4}
        className="mb-3 resize-none text-base"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />

      {showExamples && !prompt && (
        <div className="mb-4 flex flex-wrap gap-2">
          {PROMPT_EXAMPLES.slice(0, 4).map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onPromptChange(example)}
              className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Mode</Label>
          <Select
            value={settings.mode}
            onValueChange={(mode) => onSettingsChange({ ...settings, mode })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMAIL_MODE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Length</Label>
          <Select
            value={settings.length}
            onValueChange={(length) => onSettingsChange({ ...settings, length })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMAIL_LENGTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Language</Label>
          <Select
            value={settings.language}
            onValueChange={(language) => onSettingsChange({ ...settings, language })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Badge variant="muted" className="hidden sm:inline-flex">
          ⌘ + Enter to generate
        </Badge>
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isGenerating || prompt.trim().length < 3}
          className="ml-auto"
        >
          {isGenerating ? "Generating…" : "Generate Email"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
