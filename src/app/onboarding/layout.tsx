import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data/user";
import { Logo } from "@/components/logo";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Logo />
      {children}
    </div>
  );
}
