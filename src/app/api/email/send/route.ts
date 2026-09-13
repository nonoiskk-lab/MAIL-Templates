import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/security/crypto";
import { sendGmailMessage } from "@/lib/gmail/oauth";
import { sendOutlookMessage } from "@/lib/outlook/oauth";
import { toSafeErrorResponse } from "@/lib/security/errors";
import { isSameOrigin } from "@/lib/security/csrf";
import { getSiteUrlOrFallback } from "@/lib/site-url";

const sendSchema = z.object({
  provider: z.enum(["gmail", "outlook"]),
  to: z.string().email("Enter a valid recipient email address."),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, "Add a subject line."),
  body: z.string().min(1, "The email body can't be empty."),
});

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to send this email." }, { status: 401 });
    }

    const parsed = sendSchema.parse(await request.json());

    const { data: connection } = await supabase
      .from("email_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", parsed.provider)
      .maybeSingle();

    if (!connection || !connection.refresh_token_encrypted) {
      return NextResponse.json(
        { error: `Connect ${parsed.provider === "gmail" ? "Gmail" : "Outlook"} before sending.` },
        { status: 400 },
      );
    }

    const refreshToken = decryptToken(connection.refresh_token_encrypted);
    const siteUrl = getSiteUrlOrFallback(new URL(request.url).origin);

    if (parsed.provider === "gmail") {
      await sendGmailMessage({
        siteUrl,
        refreshToken,
        fromEmail: connection.email_address ?? user.email ?? "",
        to: parsed.to,
        cc: parsed.cc,
        bcc: parsed.bcc,
        subject: parsed.subject,
        body: parsed.body,
      });
    } else {
      await sendOutlookMessage({
        refreshToken,
        to: parsed.to,
        cc: parsed.cc,
        bcc: parsed.bcc,
        subject: parsed.subject,
        body: parsed.body,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[email-send]", error);
    if (error instanceof z.ZodError) return toSafeErrorResponse(error);
    return NextResponse.json({ error: "Your email could not be sent." }, { status: 502 });
  }
}
