# MailCraft AI

**Say what you mean. Send it better.**

MailCraft AI turns one plain-language sentence ("I want to become an Adobe
reseller partner") into a polished, personalized, ready-to-send business
email — with a strict no-hallucination policy, a Brand Brain that
personalizes every email to your company, and quick actions to rewrite,
shorten, translate, and improve it further.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI:** hand-built accessible primitives on Radix UI, in the shadcn/ui style
- **Backend:** Next.js Server Actions + Route Handlers
- **Database/Auth:** Supabase (Postgres + Row Level Security, Supabase Auth)
- **AI:** provider-agnostic abstraction (`src/lib/ai`) — OpenAI, Anthropic, or
  Gemini, switchable via one environment variable
- **Email sending:** Gmail (Google API) and Outlook (Microsoft Graph) OAuth,
  gated behind credentials — clearly shown as "Not connected" until configured
- **Validation:** Zod on every request, AI response, and form
- **Tests:** Vitest (unit) + Playwright (E2E smoke tests)

## What's built (Phase 1 + 2 architecture)

- Email + Google OAuth authentication, protected routes, password reset
- AI email generation with structured JSON output, intent/recipient/tone
  detection, subject line generation, and a deterministic quality-score +
  auto-rewrite self-review pass
- Quick actions: rewrite, shorten, expand, tone changes, "make human",
  improve CTA, improve subject, translate
- Brand Brain: multiple company profiles per user, with an active-company
  switcher used automatically in every generation
- User profile personalization (name, designation, contact info, tone,
  language, signature)
- Templates library (save/search/filter/favorite/duplicate/edit/delete)
- History grouped by Today / Yesterday / Last 7 Days / Older
- Global search across emails, templates, and companies
- Email preview (desktop/mobile), copy actions, save-as-template
- Gmail/Outlook OAuth connect flow, encrypted token storage (AES-256-GCM),
  and a send-with-confirmation dialog — **only active once you provide OAuth
  credentials**; otherwise the UI honestly shows "Not connected"
- Onboarding wizard, empty states, per-plan daily rate limiting
- Landing page with SEO metadata, sitemap, and robots.txt

## Roadmap (Phase 3 — intentionally not built yet)

These are structured for but not implemented, per the project's own phased
build order — nothing here is faked:

- Billing/subscriptions (the plan UI exists; no Stripe/Razorpay integration)
- Team accounts, shared templates, admin analytics dashboard
- Follow-up sequence AI
- File attachments end-to-end (validation utility exists in
  `src/lib/security/file-validation.ts`; no upload UI/storage bucket wired up yet)

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) and
   copy `.env.example` to `.env.local`, filling in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     Project Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page (server-only, used for account
     deletion)

3. **Run the database migration.** In the Supabase SQL editor, paste and run
   `supabase/migrations/0001_init.sql`. This creates every table, enables Row
   Level Security, and adds policies scoping all data to `auth.uid()`. (If
   you use the Supabase CLI locally: `supabase db push`.)

4. **Configure an AI provider.** Set `AI_PROVIDER` to `openai`, `anthropic`,
   or `gemini`, and `AI_API_KEY` to a key for that provider. Generation is
   disabled with a clear message until this is set.

5. **(Optional) Enable Google sign-in and Gmail sending**
   - In [Google Cloud Console](https://console.cloud.google.com/), create an
     OAuth 2.0 Client ID (Web application).
   - Authorized redirect URI: `{NEXT_PUBLIC_SITE_URL}/api/auth/gmail/callback`
   - For Google sign-in via Supabase Auth, also add the provider in Supabase
     Auth → Providers, using the same client ID/secret, and add
     `{SUPABASE_URL}/auth/v1/callback` as a redirect URI.
   - Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

6. **(Optional) Enable Outlook sending**
   - In [Azure Portal](https://portal.azure.com/) → App registrations, create
     an app with redirect URI `{NEXT_PUBLIC_SITE_URL}/api/auth/outlook/callback`
     and delegated permissions `Mail.Send`, `User.Read`, `offline_access`.
   - Set `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET`.

7. **Set a token encryption key** — any long random string — as
   `TOKEN_ENCRYPTION_KEY`. Required before connecting Gmail/Outlook.

8. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run test        # Vitest unit tests (AI parsing, quality scoring, validation)
npm run test:e2e    # Playwright E2E smoke tests (requires .env.local configured)
```

## Deploying

1. Push this repository to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add every variable from `.env.example` in the Vercel project's
   Environment Variables settings (use your production Supabase project and
   OAuth redirect URIs pointed at your Vercel domain).
4. Deploy. Run the same SQL migration against your production Supabase
   project before (or right after) the first deploy.

## Project structure

```
src/
  app/
    (auth)/            login, signup, password reset
    (app)/              dashboard, generate, templates, history, settings
    auth/               server actions + OAuth callback for Supabase Auth
    api/                generate, quick-action, usage, email/send, gmail/outlook OAuth
    onboarding/         first-run wizard
  components/
    ui/                 hand-built accessible primitives (button, dialog, etc.)
    generate/           prompt box, editor, preview, quality score, action bar
    dashboard/          quick templates, recent emails, usage widget
    settings/           profile, Brand Brain, connections forms
  lib/
    ai/                 provider abstraction, system prompt, schema, quality scoring
    gmail/ outlook/     OAuth + send integrations
    supabase/           browser/server clients, middleware session refresh
    security/           token encryption, rate limiting, CSRF, error mapping
supabase/
  migrations/           SQL schema + RLS policies
e2e/                    Playwright smoke tests
```
