/**
 * Auth/user domain types. Maps to the backend `/api/auth/*` contract. The API
 * calls that use these types live in `@/services/user.service`.
 *
 * Auth state lives in an HTTP-only cookie the browser manages, so nothing here
 * carries a token — success is signalled by the cookie the backend sets, and
 * identity is read back via `getCurrentUser` (in the service).
 */

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
