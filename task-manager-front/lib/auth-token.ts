/** localStorage JWT store for cross-origin Bearer/SSE auth; SSR-safe (no-op on server). */
const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  // Reject a stringified "undefined"/"null" leaking into requests.
  if (!token || token === "undefined" || token === "null") return null;
  return token;
}

export function setToken(token: string | null | undefined): void {
  if (typeof window === "undefined") return;
  // Never persist a missing token as the string "undefined".
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
