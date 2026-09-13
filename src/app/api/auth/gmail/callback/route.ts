import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeGmailCode } from "@/lib/gmail/oauth";
import { encryptToken } from "@/lib/security/crypto";
import { getSiteUrlOrFallback } from "@/lib/site-url";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin } = url;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(`${origin}/login`);

  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("gmail_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(`${origin}/settings/connections?error=gmail_state_mismatch`);
  }

  try {
    const tokens = await exchangeGmailCode(getSiteUrlOrFallback(origin), code);

    await supabase.from("email_connections").upsert(
      {
        user_id: user.id,
        provider: "gmail",
        provider_account_id: tokens.accountId,
        email_address: tokens.email,
        access_token_encrypted: tokens.accessToken ? encryptToken(tokens.accessToken) : null,
        refresh_token_encrypted: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
        token_expires_at: tokens.expiryDate,
        scopes: "gmail.send userinfo.email",
      },
      { onConflict: "user_id,provider" },
    );

    return NextResponse.redirect(`${origin}/settings/connections?connected=gmail`);
  } catch (error) {
    console.error("[gmail-callback]", error);
    return NextResponse.redirect(`${origin}/settings/connections?error=gmail_connect_failed`);
  }
}
