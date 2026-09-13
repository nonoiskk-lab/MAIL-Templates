import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-lg font-semibold tracking-tight text-primary",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        M
      </span>
      MailCraft <span className="text-secondary">AI</span>
    </Link>
  );
}
