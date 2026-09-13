import Link from "next/link";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

type Template = Database["public"]["Tables"]["saved_templates"]["Row"];

export function FavoriteTemplates({ templates }: { templates: Template[] }) {
  if (templates.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Save your best emails as reusable templates."
        description="Star a template from your library to see it here."
        actionLabel="Browse templates"
        actionHref="/templates"
      />
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {templates.map((t) => (
        <Link
          key={t.id}
          href={`/templates?open=${t.id}`}
          className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-secondary"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{t.name}</p>
            <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />
          </div>
          <Badge variant="outline" className="mt-1">
            {t.category.replace(/_/g, " ")}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
