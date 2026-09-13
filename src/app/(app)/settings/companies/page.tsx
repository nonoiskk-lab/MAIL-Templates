import { Plus, Building2 } from "lucide-react";
import { getSessionUser, getActiveCompany } from "@/lib/data/user";
import { Button } from "@/components/ui/button";
import { CompanyFormDialog } from "@/components/settings/company-form-dialog";
import { CompanyCard } from "@/components/settings/company-card";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Brand Brain" };

export default async function CompaniesSettingsPage() {
  const { user } = await getSessionUser();
  if (!user) return null;
  const { companies, profile } = await getActiveCompany(user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Brand Brain</h2>
          <p className="text-sm text-muted-foreground">
            Save your business context so MailCraft AI writes emails that sound like you.
          </p>
        </div>
        <CompanyFormDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add company
            </Button>
          }
        />
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Add a company to unlock smarter personalization."
          description="Save your industry, products, and brand voice so every email fits your business."
        />
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isActive={company.id === (profile?.active_company_id ?? companies[0]?.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
