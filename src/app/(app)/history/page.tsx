import { History } from "lucide-react";
import { getSessionUser } from "@/lib/data/user";
import { createClient } from "@/lib/supabase/server";
import { groupByRecency } from "@/lib/history-groups";
import { HistoryCard } from "@/components/history/history-card";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "History" };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;
  const { user } = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: generations } = await supabase
    .from("email_generations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const groups = groupByRecency(generations ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground">Every email MailCraft AI has generated for you.</p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={History}
          title="Your inbox of ideas is empty."
          description="Generate your first email to see it here."
          actionLabel="Write your first email"
          actionHref="/generate"
        />
      ) : (
        groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{group.label}</p>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {group.items.map((gen) => (
                <HistoryCard key={gen.id} generation={gen} autoOpen={gen.id === open} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
