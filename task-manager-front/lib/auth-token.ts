/**
 * JWT storage for header-based (Bearer) auth. The backend and frontend live on
 * different origins (Vercel + separate API), so a cross-site cookie is
 * unreliable — instead we keep the token here and send it as an
 * `Authorization: Bearer` header (see lib/api.ts) and as the SSE `?token=` query
 * param (see hooks/use-task-stream.ts).
 *
 * localStorage is readable by JS, so this is more XSS-exposed than an HTTP-only
 * cookie — an acceptable trade for a cross-origin SPA. All accessors are
 * SSR-safe (no-op on the server).
 */
const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
