/**
 * User/auth API calls. Maps 1:1 to the backend `/api/auth/*` endpoints. Each
 * call returns the unwrapped payload or throws {@link ApiError} (see lib/api).
 *
 * Auth state lives in an HTTP-only cookie the browser manages, so these
 * functions don't return or accept tokens — success is signalled by the cookie
 * the backend sets, and identity is read back via {@link getCurrentUser}.
 *
 * Types (User, Role, LoginInput, RegisterInput) live in `@/lib/auth`.
 */
import { api } from "@/lib/api";
import type { LoginInput, RegisterInput, User } from "@/lib/auth";

/** Create a USER account and log in (backend sets the auth cookie). */
export function register(input: RegisterInput): Promise<User> {
  return api.post<User>("/api/auth/register", input);
}

/** Authenticate; backend sets the auth cookie on success. */
export function login(input: LoginInput): Promise<User> {
  return api.post<User>("/api/auth/login", input);
}

/** Clear the auth cookie server-side. */
export function logout(): Promise<void> {
  return api.post<void>("/api/auth/logout");
}

/** Resolve the currently authenticated user; throws 401 ApiError if none. */
export function getCurrentUser(): Promise<User> {
  return api.get<User>("/api/auth/me");
}
