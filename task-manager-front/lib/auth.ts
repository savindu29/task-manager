/**
 * Auth API surface. Maps 1:1 to the backend `/api/auth/*` endpoints. Each call
 * returns the unwrapped payload or throws {@link ApiError} (see lib/api).
 *
 * Auth state lives in an HTTP-only cookie the browser manages, so these
 * functions don't return or accept tokens — success is signalled by the cookie
 * the backend sets, and identity is read back via {@link getCurrentUser}.
 */
import { api } from "@/lib/api";

export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

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
