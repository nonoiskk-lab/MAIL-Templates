"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { GENERATION_STAGES } from "@/lib/constants";

export function GenerationLoader() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, GENERATION_STAGES.length - 1));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
      <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      <p className="text-sm font-medium text-foreground">{GENERATION_STAGES[stage]}</p>
      <div className="flex gap-1.5">
        {GENERATION_STAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              i <= stage ? "bg-secondary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
