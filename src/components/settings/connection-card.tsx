"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail, PlugZap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { disconnectProvider } from "@/app/(app)/settings/connections/actions";

export function ConnectionCard({
  provider,
  label,
  configured,
  connectedEmail,
}: {
  provider: "gmail" | "outlook";
  label: string;
  configured: boolean;
  connectedEmail: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const connected = Boolean(connectedEmail);

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2 text-accent-foreground">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{label}</p>
            {connected ? (
              <p className="flex items-center gap-1 text-sm text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> {connectedEmail}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {configured ? "Not connected yet" : "Not connected — credentials not configured"}
              </p>
            )}
          </div>
        </div>

        {connected ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await disconnectProvider(provider);
                router.refresh();
              })
            }
          >
            Disconnect
          </Button>
        ) : configured ? (
          <Button size="sm" asChild>
            <a href={`/api/auth/${provider}`}>
              <PlugZap className="h-4 w-4" />
              Connect {label}
            </a>
          </Button>
        ) : (
          <Badge variant="muted">Not connected</Badge>
        )}
      </CardContent>
    </Card>
  );
}
