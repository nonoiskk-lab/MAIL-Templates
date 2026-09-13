import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSessionUser, getProfile } from "@/lib/data/user";
import { createClient } from "@/lib/supabase/server";
import { getUsage } from "@/lib/security/rate-limit";
import { Button } from "@/components/ui/button";
import { QuickTemplates } from "@/components/dashboard/quick-templates";
import { RecentEmails } from "@/components/dashboard/recent-emails";
import { FavoriteTemplates } from "@/components/dashboard/favorite-templates";
import { UsageWidget } from "@/components/dashboard/usage-widget";

export const metadata = { title: "Dashboard" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { user } = await getSessionUser();
  if (!user) return null;

  const [profile, supabase] = await Promise.all([getProfile(user.id), createClient()]);

  const [{ data: generations }, { data: templates }, usage] = await Promise.all([
    supabase
      .from("email_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("saved_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("favorite", true)
      .order("updated_at", { ascending: false })
      .limit(4),
    getUsage(supabase, user.id, profile?.plan ?? "free"),
  ]);

  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-muted-foreground">What email do you need today?</p>
        </div>
        <Button asChild size="lg">
          <Link href="/generate">
            Generate Email <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <QuickTemplates />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Recent emails</p>
            <Link href="/history" className="text-xs text-secondary hover:underline">
              View all
            </Link>
          </div>
          <RecentEmails generations={generations ?? []} />
        </div>
        <div className="space-y-6">
          <UsageWidget used={usage.used} limit={usage.limit} plan={profile?.plan ?? "free"} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Saved templates</p>
              <Link href="/templates" className="text-xs text-secondary hover:underline">
                View all
              </Link>
            </div>
            <FavoriteTemplates templates={templates ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
