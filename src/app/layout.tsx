import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mailcraft.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MailCraft AI — AI Email Writer & Professional Email Generator",
    template: "%s | MailCraft AI",
  },
  description:
    "Create professional, personalized emails in seconds with AI. Write sales emails, business emails, follow-ups, partnership requests, job applications and more.",
  keywords: [
    "AI email writer",
    "email generator",
    "business email AI",
    "professional email writer",
    "sales email generator",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MailCraft AI",
    title: "MailCraft AI — AI Email Writer & Professional Email Generator",
    description:
      "Say what you mean. Send it better. MailCraft AI turns one sentence into a ready-to-send professional email.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MailCraft AI — AI Email Writer & Professional Email Generator",
    description:
      "Say what you mean. Send it better. MailCraft AI turns one sentence into a ready-to-send professional email.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
