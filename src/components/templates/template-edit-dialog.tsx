"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { updateTemplate } from "@/app/(app)/templates/actions";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/database";

type Template = Database["public"]["Tables"]["saved_templates"]["Row"];

export function TemplateEditDialog({
  template,
  open,
  onOpenChange,
}: {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(template.name);
  const [category, setCategory] = useState(template.category);
  const [subject, setSubject] = useState(template.subject ?? "");
  const [body, setBody] = useState(template.body);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      await updateTemplate({
        id: template.id,
        name,
        category: category as (typeof TEMPLATE_CATEGORIES)[number],
        subject,
        body,
      });
      toast({ title: "Template updated" });
      onOpenChange(false);
    } catch {
      toast({ variant: "destructive", title: "Couldn't update template" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
          <DialogDescription>Update the content of this saved template.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
