import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getGmailAuthUrl, isGmailConfigured } from "@/lib/gmail/oauth";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { origin } = new URL(request.url);

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (!isGmailConfigured()) {
    return NextResponse.redirect(`${origin}/settings/connections?error=gmail_not_configured`);
  }

  const state = randomBytes(16).toString("hex");
  const authUrl = getGmailAuthUrl(process.env.NEXT_PUBLIC_SITE_URL ?? origin, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
