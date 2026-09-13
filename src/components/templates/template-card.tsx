"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Copy, Pencil, Trash2, FilesIcon, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateEditDialog } from "@/components/templates/template-edit-dialog";
import {
  toggleFavoriteTemplate,
  duplicateTemplate,
  deleteTemplate,
} from "@/app/(app)/templates/actions";
import { truncate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Template = Database["public"]["Tables"]["saved_templates"]["Row"];

export function TemplateCard({ template }: { template: Template }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <Card className="cursor-pointer transition-colors hover:border-secondary" onClick={() => setPreviewOpen(true)}>
        <CardContent className="pt-6">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="truncate font-medium">{template.name}</p>
            <button
              type="button"
              aria-label="Toggle favorite"
              onClick={(e) => {
                e.stopPropagation();
                startTransition(async () => {
                  await toggleFavoriteTemplate(template.id, !template.favorite);
                  router.refresh();
                });
              }}
            >
              <Star
                className={`h-4 w-4 ${template.favorite ? "fill-warning text-warning" : "text-muted-foreground"}`}
              />
            </button>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">{truncate(template.body, 100)}</p>
          <Badge variant="outline">{template.category.replace(/_/g, " ")}</Badge>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{template.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium">{template.subject}</p>
            <div className="max-h-72 overflow-y-auto whitespace-pre-line rounded-lg border border-border bg-muted/40 p-3 text-sm">
              {template.body}
            </div>
          </div>
          <DialogFooter className="flex-wrap justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${template.subject ?? ""}\n\n${template.body}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await duplicateTemplate(template.id);
                    router.refresh();
                  })
                }
              >
                <FilesIcon className="h-4 w-4" />
                Duplicate
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() =>
                startTransition(async () => {
                  await deleteTemplate(template.id);
                  setPreviewOpen(false);
                  router.refresh();
                })
              }
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TemplateEditDialog template={template} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
