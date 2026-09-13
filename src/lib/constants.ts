import {
  LayoutDashboard,
  PenSquare,
  LayoutTemplate,
  History,
  Settings,
} from "lucide-react";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: PenSquare },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/history", label: "History", icon: History },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export const PROMPT_EXAMPLES = [
  "I want to become an Adobe reseller partner",
  "Follow up with a client about an unpaid invoice",
  "Ask a supplier for their best quotation",
  "Apply for a Tender Executive position",
  "Request a meeting with a potential client",
  "Send a partnership proposal",
  "Ask a customer for payment",
];

export const EMAIL_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "sales", label: "Sales" },
  { value: "persuasive", label: "Persuasive" },
  { value: "executive", label: "Executive" },
  { value: "friendly", label: "Friendly" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "formal", label: "Formal" },
  { value: "government", label: "Government" },
  { value: "job_application", label: "Job Application" },
];

export const EMAIL_LENGTH_OPTIONS: { value: string; label: string }[] = [
  { value: "short", label: "Short (60-100 words)" },
  { value: "standard", label: "Standard (100-180 words)" },
  { value: "detailed", label: "Detailed (180-300 words)" },
];

export const TONE_OPTIONS: { value: string; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "warm", label: "Warm" },
  { value: "persuasive", label: "Persuasive" },
  { value: "executive", label: "Executive" },
  { value: "sales_focused", label: "Sales-focused" },
  { value: "assertive", label: "Assertive" },
  { value: "diplomatic", label: "Diplomatic" },
  { value: "concise", label: "Concise" },
];

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "auto", label: "Auto detect" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" },
];

export const TEMPLATE_CATEGORIES = [
  "sales",
  "follow_up",
  "partnership",
  "vendor",
  "customer",
  "payment",
  "recruitment",
  "job_application",
  "government",
  "proposal",
  "meeting",
  "networking",
  "support",
  "other",
] as const;

export const QUICK_TEMPLATES: { label: string; mode: string; prompt: string }[] = [
  { label: "Sales", mode: "sales", prompt: "Write a sales email introducing our product to a new prospect" },
  { label: "Follow-Up", mode: "follow_up", prompt: "Follow up on a proposal I sent last week that hasn't gotten a reply" },
  { label: "Partnership", mode: "persuasive", prompt: "Propose a partnership with a company in our industry" },
  { label: "Payment", mode: "professional", prompt: "Politely remind a client that their invoice payment is overdue" },
  { label: "Job Application", mode: "job_application", prompt: "Apply for an open role and highlight my relevant experience" },
  { label: "Meeting", mode: "professional", prompt: "Request a meeting with a potential client next week" },
];

export const GENERATION_STAGES = [
  "Understanding your request...",
  "Building the email strategy...",
  "Writing your email...",
  "Polishing the final version...",
];
