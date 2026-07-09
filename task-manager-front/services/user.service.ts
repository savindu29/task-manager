/** User/auth API calls for `/api/auth/*`; each returns the unwrapped payload or throws {@link ApiError}. Types in `@/lib/auth`. */
import { api } from "@/lib/api";
import type { AuthResponse, LoginInput, RegisterInput, User } from "@/lib/auth";
import { clearToken, setToken } from "@/lib/auth-token";

/** Create a USER account and log in; stores the returned JWT. */
export async function register(input: RegisterInput): Promise<User> {
  const result = await api.post<AuthResponse>("/api/auth/register", input);
  setToken(result.token);
  return result.user;
}

/** Authenticate; stores the returned JWT for subsequent Bearer requests. */
export async function login(input: LoginInput): Promise<User> {
  const result = await api.post<AuthResponse>("/api/auth/login", input);
  setToken(result.token);
  return result.user;
}

/** Clear the token locally (and best-effort the server cookie). */
export async function logout(): Promise<void> {
  try {
    await api.post<void>("/api/auth/logout");
  } finally {
    clearToken();
  }
}

/** Resolve the currently authenticated user; throws 401 ApiError if none. */
export function getCurrentUser(): Promise<User> {
  return api.get<User>("/api/auth/me");
}
