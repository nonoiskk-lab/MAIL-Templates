"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";

export function TemplateFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";

  function update(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category && next.category !== "all") params.set("category", next.category);
      else params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={q}
          placeholder="Search templates…"
          className="pl-9"
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>
      <NativeSelect
        className="sm:w-48"
        value={category}
        onChange={(e) => update({ category: e.target.value })}
      >
        <option value="all">All categories</option>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace(/_/g, " ")}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
