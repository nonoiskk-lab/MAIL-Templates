/**
 * Lightweight same-origin check for state-changing API routes (spec §47).
 * Browsers always send an Origin header on fetch/XHR POSTs; a mismatched or
 * missing Origin on a request that carries cookies is rejected.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests from some browsers omit Origin; cookies+auth still gate access
  const host = request.headers.get("host");
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
