/** Auth/user domain types for `/api/auth/*`; API calls live in `@/services/user.service`. */

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

/** Body returned by /api/auth/login and /api/auth/register. */
export interface AuthResponse {
  token: string;
  user: User;
}
