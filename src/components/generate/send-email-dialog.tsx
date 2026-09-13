"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, PlugZap } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface ConnectionSummary {
  provider: "gmail" | "outlook";
  emailAddress: string | null;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  subject,
  body,
  connections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  body: string;
  connections: ConnectionSummary[];
}) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [provider, setProvider] = useState<"gmail" | "outlook" | null>(
    connections[0]?.provider ?? null,
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const hasConnection = connections.length > 0;

  async function handleSend() {
    if (!provider || !to.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, to, cc, bcc, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Your email could not be sent.");
      setSent(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Send failed",
        description: error instanceof Error ? error.message : "Your email could not be sent.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setSent(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review email</DialogTitle>
          <DialogDescription>
            Confirm the details before sending. MailCraft AI never sends without your
            confirmation.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="font-medium">Email sent successfully</p>
          </div>
        ) : !hasConnection ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <PlugZap className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect Gmail or Outlook to send directly from MailCraft AI.
            </p>
            <Badge variant="muted">Not connected</Badge>
            <Button asChild size="sm">
              <Link href="/settings/connections">Connect an email account</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {connections.map((c) => (
                <Button
                  key={c.provider}
                  type="button"
                  size="sm"
                  variant={provider === c.provider ? "default" : "outline"}
                  onClick={() => setProvider(c.provider)}
                >
                  <Mail className="h-4 w-4" />
                  {c.provider === "gmail" ? "Gmail" : "Outlook"} ({c.emailAddress ?? "connected"})
                </Button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cc">CC</Label>
                <Input id="cc" value={cc} onChange={(e) => setCc(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bcc">BCC</Label>
                <Input id="bcc" value={bcc} onChange={(e) => setBcc(e.target.value)} />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium">{subject || "(no subject)"}</p>
              <p className="mt-1 line-clamp-4 whitespace-pre-line text-muted-foreground">{body}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {sent ? "Close" : "Cancel"}
          </Button>
          {!sent && hasConnection && (
            <Button onClick={handleSend} disabled={sending || !to.trim()}>
              {sending ? "Sending…" : "Send Email"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
