"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyFormDialog } from "@/components/settings/company-form-dialog";
import { deleteCompany } from "@/app/(app)/settings/companies/actions";
import { setActiveCompany } from "@/app/(app)/actions";
import type { Database } from "@/types/database";

type Company = Database["public"]["Tables"]["companies"]["Row"];

export function CompanyCard({
  company,
  isActive,
}: {
  company: Company;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-accent p-2 text-accent-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{company.name}</p>
              {isActive && <Badge variant="secondary">Active</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{company.industry || "No industry set"}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!isActive && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await setActiveCompany(company.id);
                  router.refresh();
                })
              }
            >
              <Check className="h-4 w-4" />
              Use
            </Button>
          )}
          <CompanyFormDialog
            company={company}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit company">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete company"
            onClick={() =>
              startTransition(async () => {
                await deleteCompany(company.id);
                router.refresh();
              })
            }
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
