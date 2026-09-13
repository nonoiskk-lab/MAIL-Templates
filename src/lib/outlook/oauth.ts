const AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
const SCOPES = ["offline_access", "Mail.Send", "User.Read"].join(" ");

export function isOutlookConfigured() {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

function getRedirectUri(siteUrl: string) {
  return `${siteUrl}/api/auth/outlook/callback`;
}

export function getOutlookAuthUrl(siteUrl: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: getRedirectUri(siteUrl),
    response_mode: "query",
    scope: SCOPES,
    state,
  });
  return `${AUTHORITY}/authorize?${params.toString()}`;
}

export async function exchangeOutlookCode(siteUrl: string, code: string) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(siteUrl),
    scope: SCOPES,
  });

  const tokenRes = await fetch(`${AUTHORITY}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!tokenRes.ok) throw new Error("Failed to exchange Outlook authorization code.");
  const tokens = await tokenRes.json();

  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = profileRes.ok ? await profileRes.json() : null;

  return {
    accessToken: tokens.access_token as string,
    refreshToken: (tokens.refresh_token as string) ?? null,
    expiresIn: tokens.expires_in as number,
    email: profile?.mail ?? profile?.userPrincipalName ?? null,
    accountId: profile?.id ?? null,
  };
}

async function getFreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: SCOPES,
  });

  const res = await fetch(`${AUTHORITY}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error("Failed to refresh Outlook access token.");
  const data = await res.json();
  return data.access_token as string;
}

export async function sendOutlookMessage({
  refreshToken,
  to,
  cc,
  bcc,
  subject,
  body,
}: {
  refreshToken: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}) {
  const accessToken = await getFreshAccessToken(refreshToken);

  const toRecipients = (email: string) => ({ emailAddress: { address: email.trim() } });

  const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "Text", content: body },
        toRecipients: to.split(",").filter(Boolean).map(toRecipients),
        ccRecipients: cc ? cc.split(",").filter(Boolean).map(toRecipients) : [],
        bccRecipients: bcc ? bcc.split(",").filter(Boolean).map(toRecipients) : [],
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Outlook send failed with status ${res.status}`);
  }
}
