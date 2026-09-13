const DEFAULT_SITE_URL = "https://mailcraft.ai";

/**
 * Validated site URL, safe to hand to `new URL()`. Falls back to the
 * default if NEXT_PUBLIC_SITE_URL is unset or isn't a real absolute URL
 * (e.g. misconfigured in a hosting provider's dashboard) so a bad
 * environment variable can never crash the build or a request.
 */
export function getSiteUrl(): string {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL;
  if (!candidate) return DEFAULT_SITE_URL;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    console.warn(
      `NEXT_PUBLIC_SITE_URL is set to "${candidate}", which is not a valid URL. Falling back to ${DEFAULT_SITE_URL}.`,
    );
    return DEFAULT_SITE_URL;
  }
}

/**
 * Same validation as `getSiteUrl`, but falls back to a request-derived
 * origin (e.g. the current request's `host` header) instead of the
 * hardcoded default when NEXT_PUBLIC_SITE_URL is unset or invalid.
 */
export function getSiteUrlOrFallback(fallbackOrigin: string): string {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL;
  if (!candidate) return fallbackOrigin;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    console.warn(
      `NEXT_PUBLIC_SITE_URL is set to "${candidate}", which is not a valid URL. Falling back to the request origin.`,
    );
    return fallbackOrigin;
  }
}
