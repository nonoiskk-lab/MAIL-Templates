"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TONE_OPTIONS } from "@/lib/constants";
import { saveOnboarding, skipOnboarding } from "@/app/onboarding/actions";

type Step = "welcome" | "name" | "company" | "tone" | "signature";

const STEPS: Step[] = ["welcome", "name", "company", "tone", "signature"];

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    designation: "",
    companyName: "",
    industry: "",
    tone: "professional",
    signature: "",
  });

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function next() {
    if (isLast) return finish();
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  async function finish() {
    setSaving(true);
    await saveOnboarding(form);
    router.push("/generate");
    router.refresh();
  }

  async function skipAll() {
    setSaving(true);
    await skipOnboarding();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <div className="mb-1 flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-secondary" : "bg-muted"}`}
            />
          ))}
        </div>
        <CardTitle>
          {step === "welcome" && "Welcome to MailCraft AI"}
          {step === "name" && "What should we call you?"}
          {step === "company" && "Tell us about your business"}
          {step === "tone" && "How do you usually write?"}
          {step === "signature" && "Your default sign-off"}
        </CardTitle>
        <CardDescription>
          {step === "welcome" && "Let's personalize your emails in under a minute."}
          {step === "name" && "Used to sign your emails automatically."}
          {step === "company" && "This becomes your Brand Brain — you can add more later."}
          {step === "tone" && "We'll use this as your default, and you can change it per email."}
          {step === "signature" && "Optional — skip it and we'll use a placeholder instead."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "welcome" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Sparkles className="h-10 w-10 text-secondary" />
            <p className="text-sm text-muted-foreground">
              Describe an email in one sentence — MailCraft AI turns it into a ready-to-send,
              professional email.
            </p>
          </div>
        )}

        {step === "name" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Jordan Lee"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="Head of Partnerships"
              />
            </div>
          </>
        )}

        {step === "company" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Acme Inc."
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="IT hardware & solutions"
              />
            </div>
          </>
        )}

        {step === "tone" && (
          <div className="space-y-1.5">
            <Label htmlFor="tone">Preferred tone</Label>
            <NativeSelect
              id="tone"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        {step === "signature" && (
          <div className="space-y-1.5">
            <Label htmlFor="signature">Signature</Label>
            <Textarea
              id="signature"
              rows={4}
              value={form.signature}
              onChange={(e) => setForm({ ...form, signature: e.target.value })}
              placeholder={"Best regards,\nJordan Lee\nHead of Partnerships, Acme Inc."}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={skipAll} disabled={saving}>
            Skip for now
          </Button>
          <Button onClick={next} disabled={saving}>
            {isLast ? "Create your first email" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
