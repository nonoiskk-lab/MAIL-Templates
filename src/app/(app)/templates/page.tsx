import { LayoutTemplate } from "lucide-react";
import { getSessionUser } from "@/lib/data/user";
import { createClient } from "@/lib/supabase/server";
import { TemplateFilters } from "@/components/templates/template-filters";
import { TemplateCard } from "@/components/templates/template-card";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Templates" };

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const { user } = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  let query = supabase
    .from("saved_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (q) query = query.or(`name.ilike.%${q}%,body.ilike.%${q}%,subject.ilike.%${q}%`);

  const { data: templates } = await query;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Reuse your best emails.</p>
      </div>
      <TemplateFilters />
      {!templates || templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Save your best emails as reusable templates."
          description="Generate an email and hit Save to build your library."
          actionLabel="Generate an email"
          actionHref="/generate"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
