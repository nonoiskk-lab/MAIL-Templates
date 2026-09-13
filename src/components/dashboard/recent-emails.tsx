import Link from "next/link";
import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate, truncate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Generation = Database["public"]["Tables"]["email_generations"]["Row"];

export function RecentEmails({ generations }: { generations: Generation[] }) {
  if (generations.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Your inbox of ideas is empty."
        description="Describe an email you need and MailCraft AI will draft it for you."
        actionLabel="Write your first email"
        actionHref="/generate"
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {generations.map((gen) => (
        <Link
          key={gen.id}
          href={`/history?open=${gen.id}`}
          className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{gen.subject || truncate(gen.prompt, 60)}</p>
            <p className="truncate text-xs text-muted-foreground">{truncate(gen.prompt, 80)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {gen.intent && <Badge variant="outline">{gen.intent.replace(/_/g, " ")}</Badge>}
            <span className="text-xs text-muted-foreground">{formatDate(gen.created_at)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
