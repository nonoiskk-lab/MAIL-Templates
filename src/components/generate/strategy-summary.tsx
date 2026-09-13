import { Badge } from "@/components/ui/badge";
import type { StructuredEmailOutput } from "@/lib/ai/schema";

function labelize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StrategySummary({ structured }: { structured: StructuredEmailOutput }) {
  const chips: { label: string; value: string }[] = [
    { label: "Intent", value: structured.intent },
    { label: "Recipient", value: structured.recipient_type },
    { label: "Objective", value: structured.objective },
    { label: "Tone", value: structured.tone },
  ];

  return (
    <div className="rounded-xl border border-border bg-accent/40 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        AI email strategy
      </p>
      <div className="flex flex-wrap gap-2">
        {chips
          .filter((c) => c.value)
          .map((chip) => (
            <Badge key={chip.label} variant="accent">
              {chip.label}: {labelize(chip.value)}
            </Badge>
          ))}
      </div>
      {structured.value_proposition && (
        <p className="mt-3 text-sm text-foreground/80">{structured.value_proposition}</p>
      )}
    </div>
  );
}
