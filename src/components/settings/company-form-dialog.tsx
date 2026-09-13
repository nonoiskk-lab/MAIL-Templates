"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCompany, updateCompany } from "@/app/(app)/settings/companies/actions";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

const FIELDS: { name: keyof Company; label: string; textarea?: boolean; placeholder?: string }[] = [
  { name: "name", label: "Company name" },
  { name: "industry", label: "Industry" },
  { name: "website", label: "Website" },
  { name: "customer_type", label: "Customer type" },
  { name: "description", label: "Company description", textarea: true },
  { name: "products", label: "Products", textarea: true },
  { name: "services", label: "Services", textarea: true },
  { name: "usp", label: "USP", textarea: true },
  { name: "target_audience", label: "Target audience", textarea: true },
  { name: "brand_voice", label: "Brand voice", textarea: true },
  { name: "achievements", label: "Company achievements", textarea: true, placeholder: "Only real, verifiable achievements — never invented by AI." },
  { name: "differentiators", label: "Key differentiators", textarea: true },
  { name: "contact_information", label: "Contact information", textarea: true },
];

const NAME_MAP: Record<string, string> = {
  name: "name",
  industry: "industry",
  website: "website",
  customer_type: "customerType",
  description: "description",
  products: "products",
  services: "services",
  usp: "usp",
  target_audience: "targetAudience",
  brand_voice: "brandVoice",
  achievements: "achievements",
  differentiators: "differentiators",
  contact_information: "contactInformation",
};

export function CompanyFormDialog({
  company,
  trigger,
}: {
  company?: Company;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = company
      ? await updateCompany(company.id, null, formData)
      : await createCompany(null, formData);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company ? "Edit company" : "Add a company"}</DialogTitle>
          <DialogDescription>
            This is your Brand Brain — MailCraft AI uses it to personalize emails for this
            company only.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div
              key={field.name}
              className={field.textarea ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
            >
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.textarea ? (
                <Textarea
                  id={field.name}
                  name={NAME_MAP[field.name]}
                  rows={2}
                  placeholder={field.placeholder}
                  defaultValue={(company?.[field.name] as string) ?? ""}
                />
              ) : (
                <Input
                  id={field.name}
                  name={NAME_MAP[field.name]}
                  required={field.name === "name"}
                  defaultValue={(company?.[field.name] as string) ?? ""}
                />
              )}
            </div>
          ))}
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : company ? "Save changes" : "Add company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
