import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function isGmailConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function getRedirectUri(siteUrl: string) {
  return `${siteUrl}/api/auth/gmail/callback`;
}

function getOAuthClient(siteUrl: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri(siteUrl),
  );
}

export function getGmailAuthUrl(siteUrl: string, state: string) {
  const client = getOAuthClient(siteUrl);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeGmailCode(siteUrl: string, code: string) {
  const client = getOAuthClient(siteUrl);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  return {
    accessToken: tokens.access_token ?? null,
    refreshToken: tokens.refresh_token ?? null,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    email: data.email ?? null,
    accountId: data.id ?? null,
  };
}

async function getFreshAccessToken(siteUrl: string, refreshToken: string) {
  const client = getOAuthClient(siteUrl);
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials.access_token!;
}

function buildRawMessage({
  from,
  to,
  cc,
  bcc,
  subject,
  body,
}: {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}) {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
  ]
    .filter(Boolean)
    .join("\r\n");

  const message = `${headers}\r\n\r\n${body}`;
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmailMessage({
  siteUrl,
  refreshToken,
  fromEmail,
  to,
  cc,
  bcc,
  subject,
  body,
}: {
  siteUrl: string;
  refreshToken: string;
  fromEmail: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}) {
  const accessToken = await getFreshAccessToken(siteUrl, refreshToken);
  const raw = buildRawMessage({ from: fromEmail, to, cc, bcc, subject, body });

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    throw new Error(`Gmail send failed with status ${res.status}`);
  }

  return res.json();
}
