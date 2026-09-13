import { getSessionUser } from "@/lib/data/user";
import { createClient } from "@/lib/supabase/server";
import { Generator } from "@/components/generate/generator";
import { isAIConfigured } from "@/lib/ai";
import type { ConnectionSummary } from "@/components/generate/send-email-dialog";

export const metadata = { title: "Generate an email" };

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; mode?: string }>;
}) {
  const { prompt, mode } = await searchParams;
  const { user } = await getSessionUser();
  const supabase = await createClient();

  let connections: ConnectionSummary[] = [];
  if (user) {
    const { data } = await supabase
      .from("email_connections")
      .select("provider, email_address")
      .eq("user_id", user.id);
    connections = (data ?? []).map((c) => ({ provider: c.provider, emailAddress: c.email_address }));
  }

  return (
    <Generator
      initialPrompt={prompt ?? ""}
      initialMode={mode}
      connections={connections}
      aiConfigured={isAIConfigured()}
    />
  );
}
