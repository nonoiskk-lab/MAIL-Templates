import { redirect } from "next/navigation";
import { getSessionUser, getActiveCompany } from "@/lib/data/user";
import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { CompanySwitcher } from "@/components/app-shell/company-switcher";
import { UserMenu } from "@/components/app-shell/user-menu";
import { GlobalSearch } from "@/components/app-shell/global-search";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSessionUser();
  if (!user) redirect("/login");

  const { profile, companies } = await getActiveCompany(user.id);

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <div className="px-3 pb-3">
          <CompanySwitcher companies={companies} activeCompanyId={profile?.active_company_id} />
        </div>
        <SidebarNav />
        <div className="p-3 text-xs text-muted-foreground">
          MailCraft AI · {profile?.plan ?? "free"} plan
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
          <MobileNav />
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-3">
            <UserMenu name={profile?.full_name ?? null} email={profile?.email ?? user.email ?? null} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
