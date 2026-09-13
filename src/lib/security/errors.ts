import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AIProviderError } from "@/lib/ai/types";
import { RateLimitExceededError } from "@/lib/security/rate-limit";

/**
 * Maps internal errors to the safe, user-facing messages from spec §49.
 * Raw backend errors (stack traces, provider payloads) are logged server-side
 * only and never sent to the client.
 */
export function toSafeErrorResponse(error: unknown): NextResponse {
  if (error instanceof RateLimitExceededError) {
    return NextResponse.json(
      { error: "You've reached your current usage limit." },
      { status: 429 },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "That request wasn't valid." },
      { status: 400 },
    );
  }

  if (error instanceof AIProviderError) {
    console.error("[AIProviderError]", error.cause ?? error);
    return NextResponse.json(
      { error: "AI is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }

  console.error("[UnhandledError]", error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
