"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  return (
    <form
      className="relative hidden max-w-sm flex-1 md:block"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search emails, templates, companies…"
        className="pl-9"
        aria-label="Global search"
      />
    </form>
  );
}
