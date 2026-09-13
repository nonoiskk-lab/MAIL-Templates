import { getSessionUser } from "@/lib/data/user";
import { createClient } from "@/lib/supabase/server";
import { ConnectionCard } from "@/components/settings/connection-card";
import { isGmailConfigured } from "@/lib/gmail/oauth";
import { isOutlookConfigured } from "@/lib/outlook/oauth";

export const metadata = { title: "Connections" };

export default async function ConnectionsSettingsPage() {
  const { user } = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: connections } = await supabase
    .from("email_connections")
    .select("provider, email_address")
    .eq("user_id", user.id);

  const gmail = connections?.find((c) => c.provider === "gmail");
  const outlook = connections?.find((c) => c.provider === "outlook");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Email connections</h2>
        <p className="text-sm text-muted-foreground">
          Connect Gmail or Outlook to send generated emails directly. MailCraft AI always asks
          for confirmation before sending — nothing is ever sent automatically.
        </p>
      </div>
      <ConnectionCard
        provider="gmail"
        label="Gmail"
        configured={isGmailConfigured()}
        connectedEmail={gmail?.email_address ?? null}
      />
      <ConnectionCard
        provider="outlook"
        label="Outlook"
        configured={isOutlookConfigured()}
        connectedEmail={outlook?.email_address ?? null}
      />
    </div>
  );
}
