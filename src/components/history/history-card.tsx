"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Trash2, RefreshCw, Save, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaveTemplateDialog } from "@/components/generate/save-template-dialog";
import { deleteGeneration } from "@/app/(app)/history/actions";
import { formatDate, truncate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Generation = Database["public"]["Tables"]["email_generations"]["Row"];

export function HistoryCard({ generation, autoOpen }: { generation: Generation; autoOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(autoOpen));
  const [saveOpen, setSaveOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{generation.subject || truncate(generation.prompt, 60)}</p>
          <p className="truncate text-xs text-muted-foreground">{truncate(generation.prompt, 90)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {generation.intent && <Badge variant="outline">{generation.intent.replace(/_/g, " ")}</Badge>}
          <span className="text-xs text-muted-foreground">{formatDate(generation.created_at)}</span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{generation.subject || "Generated email"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Prompt: {generation.prompt}</p>
            <div className="max-h-72 overflow-y-auto whitespace-pre-line rounded-lg border border-border bg-muted/40 p-3 text-sm">
              {generation.body}
            </div>
          </div>
          <DialogFooter className="flex-wrap justify-between sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${generation.subject ?? ""}\n\n${generation.body}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/generate?prompt=${encodeURIComponent(generation.prompt)}`}>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)}>
                <Save className="h-4 w-4" />
                Save as template
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteGeneration(generation.id);
                  setOpen(false);
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

      <SaveTemplateDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        subject={generation.subject ?? ""}
        body={generation.body}
        tone={generation.tone ?? undefined}
        language={generation.language ?? undefined}
        companyId={generation.company_id}
      />
    </>
  );
}
