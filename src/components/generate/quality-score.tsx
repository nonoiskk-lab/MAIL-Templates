import { cn } from "@/lib/utils";
import type { QualityResult } from "@/lib/ai/quality";

const LABELS: Record<keyof QualityResult["breakdown"], string> = {
  clarity: "Clarity",
  professionalism: "Professionalism",
  persuasiveness: "Persuasiveness",
  humanQuality: "Human Quality",
  ctaStrength: "CTA Strength",
  grammar: "Grammar",
  personalization: "Personalization",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function QualityScore({ quality }: { quality: QualityResult }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Email quality score</p>
        <p className={cn("text-2xl font-bold", scoreColor(quality.overall))}>
          {quality.overall}
          <span className="text-sm font-normal text-muted-foreground">/100</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {(Object.keys(quality.breakdown) as (keyof QualityResult["breakdown"])[]).map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{LABELS[key]}</span>
              <span>{quality.breakdown[key]}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  quality.breakdown[key] >= 80
                    ? "bg-success"
                    : quality.breakdown[key] >= 60
                      ? "bg-warning"
                      : "bg-destructive",
                )}
                style={{ width: `${quality.breakdown[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {quality.issues.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {quality.issues.map((issue) => (
            <li key={issue}>• {issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
