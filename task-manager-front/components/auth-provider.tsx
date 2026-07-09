"use client";

/** Client-side auth state: resolves the current user on mount; consumed via {@link useAuth}. */
import * as React from "react";
import * as auth from "@/services/user.service";
import { ApiError } from "@/lib/api";
import type { LoginInput, RegisterInput, User } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  /** Re-fetch the current user (e.g. after an out-of-band change). */
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");

  const refresh = React.useCallback(async () => {
    try {
      const current = await auth.getCurrentUser();
      setUser(current);
      setStatus("authenticated");
    } catch (error) {
      // 401 means "not logged in"; log anything else.
      if (!(error instanceof ApiError) || error.status !== 401) {
        console.error("Failed to resolve current user", error);
      }
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  // Resolve the session once on mount; guarded against a stale result.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const current = await auth.getCurrentUser();
        if (active) {
          setUser(current);
          setStatus("authenticated");
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          console.error("Failed to resolve current user", error);
        }
        if (active) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = React.useCallback(async (input: LoginInput) => {
    const loggedIn = await auth.login(input);
    setUser(loggedIn);
    setStatus("authenticated");
    return loggedIn;
  }, []);

  const register = React.useCallback(async (input: RegisterInput) => {
    const registered = await auth.register(input);
    setUser(registered);
    setStatus("authenticated");
    return registered;
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      // Clear local state regardless of the network outcome.
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refresh }),
    [user, status, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
