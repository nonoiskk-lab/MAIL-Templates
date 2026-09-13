import { Zap } from "lucide-react";

export function UsageWidget({
  used,
  limit,
  plan,
}: {
  used: number;
  limit: number;
  plan: string;
}) {
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Zap className="h-4 w-4 text-secondary" />
          Today&apos;s usage
        </p>
        <span className="text-xs uppercase text-muted-foreground">{plan}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {used} / {limit} generations used today
      </p>
    </div>
  );
}
