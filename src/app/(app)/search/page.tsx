import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { getSessionUser } from "@/lib/data/user";
import { createClient } from "@/lib/supabase/server";
import { formatDate, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { user } = await getSessionUser();
  if (!user) return null;

  if (!q) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <EmptyState icon={SearchIcon} title="Search your emails, templates and companies." />
      </div>
    );
  }

  const supabase = await createClient();
  const like = `%${q}%`;

  const [{ data: emails }, { data: templates }, { data: companies }] = await Promise.all([
    supabase
      .from("email_generations")
      .select("*")
      .eq("user_id", user.id)
      .or(`prompt.ilike.${like},subject.ilike.${like},body.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("saved_templates")
      .select("*")
      .eq("user_id", user.id)
      .or(`name.ilike.${like},subject.ilike.${like},body.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .ilike("name", like)
      .limit(20),
  ]);

  const total = (emails?.length ?? 0) + (templates?.length ?? 0) + (companies?.length ?? 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search results for &ldquo;{q}&rdquo;</h1>
        <p className="text-muted-foreground">{total} result{total === 1 ? "" : "s"}</p>
      </div>

      {total === 0 && <EmptyState icon={SearchIcon} title="No results found." description="Try a different search term." />}

      {(emails?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Emails</p>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {emails!.map((e) => (
              <Link
                key={e.id}
                href={`/history?open=${e.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.subject || truncate(e.prompt, 60)}</p>
                  <p className="truncate text-xs text-muted-foreground">{truncate(e.prompt, 90)}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(e.created_at)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(templates?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Templates</p>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {templates!.map((t) => (
              <Link
                key={t.id}
                href={`/templates?open=${t.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60"
              >
                <p className="truncate text-sm font-medium">{t.name}</p>
                <Badge variant="outline">{t.category.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(companies?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Companies</p>
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {companies!.map((c) => (
              <Link
                key={c.id}
                href="/settings/companies"
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/60"
              >
                <p className="truncate text-sm font-medium">{c.name}</p>
                <span className="text-xs text-muted-foreground">{c.industry}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
