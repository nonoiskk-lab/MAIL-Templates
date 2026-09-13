"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { PromptBox, type PromptSettings } from "@/components/generate/prompt-box";
import { GenerationLoader } from "@/components/generate/generation-loader";
import { StrategySummary } from "@/components/generate/strategy-summary";
import { SubjectPicker } from "@/components/generate/subject-picker";
import { EmailEditor } from "@/components/generate/email-editor";
import { EmailPreview } from "@/components/generate/email-preview";
import { QualityScore } from "@/components/generate/quality-score";
import { ActionBar } from "@/components/generate/action-bar";
import { SaveTemplateDialog } from "@/components/generate/save-template-dialog";
import { SendEmailDialog, type ConnectionSummary } from "@/components/generate/send-email-dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { StructuredEmailOutput } from "@/lib/ai/schema";
import type { QualityResult } from "@/lib/ai/quality";
import type { QuickAction } from "@/lib/ai/schema";

export function Generator({
  initialPrompt = "",
  initialMode,
  connections,
  aiConfigured,
}: {
  initialPrompt?: string;
  initialMode?: string;
  connections: ConnectionSummary[];
  aiConfigured: boolean;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [settings, setSettings] = useState<PromptSettings>({
    mode: initialMode ?? "professional",
    length: "standard",
    language: "auto",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structured, setStructured] = useState<StructuredEmailOutput | null>(null);
  const [quality, setQuality] = useState<QualityResult | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busyAction, setBusyAction] = useState<QuickAction | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  async function handleGenerate() {
    if (prompt.trim().length < 3) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, ...settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStructured(data.structured);
      setQuality(data.quality);
      setSubject(data.structured.subject_options[0] ?? "");
      setBody(data.structured.email_body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      {!aiConfigured && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            AI is not connected yet. Add <code>AI_PROVIDER</code> and <code>AI_API_KEY</code> to your
            environment to enable generation.
          </p>
        </div>
      )}

      <PromptBox
        prompt={prompt}
        onPromptChange={setPrompt}
        settings={settings}
        onSettingsChange={setSettings}
        onSubmit={handleGenerate}
        isGenerating={isGenerating}
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isGenerating && <GenerationLoader />}

      {!isGenerating && structured && quality && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <StrategySummary structured={structured} />
            <SubjectPicker options={structured.subject_options} value={subject} onChange={setSubject} />
            <EmailEditor value={body} onChange={setBody} />
            <EmailPreview subject={subject} body={body} />
            <QualityScore quality={quality} />
            <ActionBar
              subject={subject}
              body={body}
              busyAction={busyAction}
              setBusyAction={setBusyAction}
              onResult={(result) => {
                setSubject(result.subject || subject);
                setBody(result.body);
              }}
              onSave={() => setSaveOpen(true)}
              onSend={() => setSendOpen(true)}
            />
          </CardContent>
        </Card>
      )}

      <SaveTemplateDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        subject={subject}
        body={body}
        tone={structured?.tone}
        language={structured?.language}
      />
      <SendEmailDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        subject={subject}
        body={body}
        connections={connections}
      />
    </div>
  );
}
