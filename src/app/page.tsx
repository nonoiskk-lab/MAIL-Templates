import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Building2,
  LayoutTemplate,
  PenSquare,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MailCraft AI — AI Email Writer & Professional Email Generator",
  description:
    "Create professional, personalized emails in seconds with AI. Write sales emails, business emails, follow-ups, partnership requests, job applications and more.",
};

const USE_CASES = [
  { title: "Sales", copy: "Turn a one-line idea into a benefit-led outreach email." },
  { title: "Business", copy: "Vendor requests, proposals, quotations — handled." },
  { title: "Partnership", copy: "Reach out to potential partners with a credible pitch." },
  { title: "Customer Support", copy: "Calm, clear responses to complaints and requests." },
  { title: "Job Applications", copy: "Apply for roles with a professional, tailored email." },
  { title: "Follow-Ups", copy: "Never let a good lead go cold again." },
];

const FEATURES = [
  { icon: Sparkles, title: "AI Writing", copy: "Understands intent, recipient, and objective — not just your words." },
  { icon: Building2, title: "Brand Brain", copy: "Save your business context once; every email reflects it." },
  { icon: LayoutTemplate, title: "Templates", copy: "Save and reuse your best-performing emails." },
  { icon: PenSquare, title: "Editor", copy: "A premium editor with quick actions: rewrite, shorten, translate." },
  { icon: Mail, title: "Gmail & Outlook", copy: "Send straight from MailCraft AI once connected — always with confirmation." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start Writing Free</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-secondary">
            Say what you mean. Send it better.
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Write Better Emails. In Seconds.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Describe what you want to say. MailCraft AI turns it into a professional email ready
            to send.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Writing Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </section>

        {/* Example */}
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Before
            </p>
            <p className="rounded-lg bg-muted px-4 py-3 text-sm">
              &ldquo;I want to ask client for payment&rdquo;
            </p>
            <div className="my-4 flex items-center justify-center text-muted-foreground">
              <ArrowRight className="h-5 w-5 rotate-90" />
            </div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              After
            </p>
            <div className="space-y-2 rounded-lg border border-border bg-white px-4 py-3 text-sm">
              <p className="font-medium">Subject: Following up on Invoice #[Invoice Number]</p>
              <p className="text-muted-foreground">
                Hi [Client Name], I wanted to follow up on invoice #[Invoice Number], which was
                due on [Date]. Could you confirm the payment status on your end?…
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                { step: "1", title: "Tell us what you need", copy: "One sentence is enough." },
                { step: "2", title: "AI understands your intent", copy: "Recipient, objective, tone, and context." },
                { step: "3", title: "Get a ready-to-send email", copy: "Edit, copy, save, or send." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {item.step}
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Built for every business email</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="rounded-xl border border-border bg-card p-5">
                <p className="font-medium">{uc.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{uc.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Everything you need</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-3">
                  <f.icon className="h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-medium">{f.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{f.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* No hallucination trust section */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-success" />
          <h2 className="text-xl font-semibold">Built with a strict no-hallucination policy</h2>
          <p className="mt-2 text-muted-foreground">
            MailCraft AI never invents prices, claims, names, or dates. Missing details become
            clear placeholders you fill in — never fabricated facts.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Write your next email with AI.
          </h2>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/signup">
              Start Writing Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} MailCraft AI</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
