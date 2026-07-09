/** Typed axios client: attaches Bearer token, unwraps the envelope, throws ApiError. */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

import { getToken } from "@/lib/auth-token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Standard response envelope returned by every backend endpoint. */
export interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  message: string;
  timestamp: string;
  data: T;
}

/** Error for any non-2xx/transport failure; carries backend code/message and per-field validation errors. */
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

/** Build an {@link ApiError} from a (possibly missing) response envelope. */
function toApiError(
  status: number,
  envelope: Partial<ApiEnvelope<unknown>> | undefined,
): ApiError {
  const data = envelope?.data;
  const fieldErrors =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, string>)
      : {};

  return new ApiError(
    status,
    envelope?.code ?? "UNKNOWN",
    envelope?.message ?? "Something went wrong. Please try again.",
    fieldErrors,
  );
}

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT as a Bearer header when present (primary cross-origin auth).
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap the envelope on the way out; turn any failure into an ApiError.
client.interceptors.response.use(
  (response) => {
    const envelope = response.data as Partial<ApiEnvelope<unknown>> | undefined;
    // A 2xx with success:false is still a business error (mirrors backend).
    if (envelope && envelope.success === false) {
      throw toApiError(response.status, envelope);
    }
    // Replace the raw envelope with the unwrapped `data` payload.
    response.data = envelope ? envelope.data : undefined;
    return response;
  },
  (error: AxiosError) => {
    if (error instanceof ApiError) throw error;
    if (error.response) {
      throw toApiError(
        error.response.status,
        error.response.data as Partial<ApiEnvelope<unknown>> | undefined,
      );
    }
    // No response = network error, backend down, CORS rejection, etc.
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Unable to reach the server. Please check your connection and try again.",
    );
  },
);

/** Per-call overrides (headers, params, signal, …); method/url/data are set by the helpers. */
export type RequestOptions = Omit<
  AxiosRequestConfig,
  "url" | "method" | "data" | "baseURL"
>;

/** Perform a request and return the unwrapped `data`; throws {@link ApiError} on any error. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config);
  return response.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>({ ...options, url: path, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ ...options, url: path, method: "POST", data: body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ ...options, url: path, method: "PUT", data: body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>({ ...options, url: path, method: "PATCH", data: body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>({ ...options, url: path, method: "DELETE" }),
};
