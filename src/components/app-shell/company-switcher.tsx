"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setActiveCompany } from "@/app/(app)/actions";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

export function CompanySwitcher({
  companies,
  activeCompanyId,
}: {
  companies: Company[];
  activeCompanyId: string | null | undefined;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const active = companies.find((c) => c.id === activeCompanyId) ?? companies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal"
          disabled={isPending}
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{active?.name ?? "No company yet"}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Brand Brain</DropdownMenuLabel>
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() =>
              startTransition(async () => {
                await setActiveCompany(company.id);
                router.refresh();
              })
            }
            className="justify-between"
          >
            <span className="truncate">{company.name}</span>
            {company.id === active?.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings/companies")}>
          <Plus className="h-4 w-4" />
          Add a company
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
