"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function SubjectPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Subject line</p>
      <div className="space-y-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              value === option
                ? "border-secondary bg-accent"
                : "border-border hover:bg-muted",
            )}
          >
            <span className="truncate">{option}</span>
            {value === option && <Check className="h-4 w-4 shrink-0 text-secondary" />}
          </button>
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Edit subject line"
        aria-label="Subject line"
      />
    </div>
  );
}
