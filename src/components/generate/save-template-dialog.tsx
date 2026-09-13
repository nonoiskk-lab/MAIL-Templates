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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { createTemplate } from "@/app/(app)/templates/actions";
import { useToast } from "@/hooks/use-toast";

export function SaveTemplateDialog({
  open,
  onOpenChange,
  subject,
  body,
  tone,
  language,
  companyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  body: string;
  tone?: string;
  language?: string;
  companyId?: string | null;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createTemplate({
        name: name.trim(),
        category: category as (typeof TEMPLATE_CATEGORIES)[number],
        subject,
        body,
        tone,
        language,
        companyId,
      });
      toast({ title: "Template saved", description: `"${name}" is ready to reuse.` });
      onOpenChange(false);
      setName("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't save template",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as template</DialogTitle>
          <DialogDescription>Reuse this email next time you need something similar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Partnership outreach"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Save template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
