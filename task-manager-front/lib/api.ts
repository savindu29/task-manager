/**
 * Thin, typed client for the task-manager backend.
 *
 * The backend authenticates via an HTTP-only JWT cookie, so the browser sends
 * and receives it automatically — we never read or store the token in JS. Every
 * request therefore uses `credentials: "include"` so the cookie travels
 * cross-origin (the backend enables CORS `allowCredentials`).
 *
 * Responses are wrapped in a standard envelope (see backend `ApiResponse`):
 *   { success, code, message, timestamp, data }
 * `request()` unwraps `data` on success and throws a typed `ApiError` otherwise.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Standard response envelope returned by every backend endpoint. */
export interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  timestamp: string;
  data: T;
}

/**
 * Error thrown for any non-2xx response (or transport failure). Carries the
 * backend error `code`/`message` plus per-field validation errors when the
 * backend returns them (INVALID_REQUEST puts `{ field: message }` in `data`).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Perform a request against the API and return the unwrapped `data` payload.
 * Throws {@link ApiError} on any error so callers can `try/catch` uniformly.
 */
export async function request<T>(
  path: string,
  { body, headers, ...init }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network error, backend down, CORS rejection, etc.
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Unable to reach the server. Please check your connection and try again.",
    );
  }

  // 204 / empty bodies (e.g. logout) — nothing to parse.
  const text = await response.text();
  const envelope: Partial<ApiEnvelope<T>> = text ? JSON.parse(text) : {};

  if (!response.ok || envelope.success === false) {
    const data = envelope.data;
    const fieldErrors =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, string>)
        : {};

    throw new ApiError(
      response.status,
      envelope.code ?? "UNKNOWN",
      envelope.message ?? "Something went wrong. Please try again.",
      fieldErrors,
    );
  }

  return envelope.data as T;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "DELETE" }),
};
