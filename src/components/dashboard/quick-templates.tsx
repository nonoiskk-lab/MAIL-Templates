import Link from "next/link";
import { QUICK_TEMPLATES } from "@/lib/constants";

export function QuickTemplates() {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">Quick templates</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_TEMPLATES.map((t) => (
          <Link
            key={t.label}
            href={`/generate?prompt=${encodeURIComponent(t.prompt)}&mode=${t.mode}`}
            className="rounded-lg border border-border bg-card px-3 py-3 text-sm font-medium transition-colors hover:border-secondary hover:bg-accent"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
