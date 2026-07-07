/**
 * Task API surface for the authenticated USER. Maps 1:1 to `/api/tasks/*`.
 * Every call is scoped server-side to the caller's own tasks (owner comes from
 * the auth principal, never the client). Returns unwrapped payloads or throws
 * {@link ApiError}.
 */
import { api } from "@/lib/api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

/** Badge styling per status (keyed by backend status code). */
export const STATUS_META: Record<TaskStatus, { dot: string; pill: string }> = {
  TODO: { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { dot: "bg-amber-500", pill: "bg-amber-100 text-amber-700" },
  DONE: { dot: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-700" },
};

/**
 * Human-friendly label for a status code: drops underscores and sentence-cases
 * it, e.g. "IN_PROGRESS" -> "In progress". Use this everywhere a status is
 * shown so display stays consistent.
 */
export function formatStatus(code: string): string {
  const text = code.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string; // ISO-8601 instant
  ownerId: number;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate: string; // ISO-8601 instant
}

export interface UpdateTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string; // ISO-8601 instant
}

export interface PageMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
  numberOfElements: number;
}

export interface Paginated<T> {
  content: T[];
  pagination: PageMeta;
}

export interface ListTasksParams {
  status?: TaskStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

function buildQuery(params: ListTasksParams): string {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page != null) query.set("page", String(params.page));
  if (params.size != null) query.set("size", String(params.size));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortDirection) query.set("sortDirection", params.sortDirection);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Paginated list of the current user's tasks, optionally filtered by status. */
export function listTasks(
  params: ListTasksParams = {},
): Promise<Paginated<Task>> {
  return api.get<Paginated<Task>>(`/api/tasks${buildQuery(params)}`);
}

export function getTask(id: number): Promise<Task> {
  return api.get<Task>(`/api/tasks/${id}`);
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return api.post<Task>("/api/tasks", input);
}

export function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  return api.put<Task>(`/api/tasks/${id}`, input);
}

export function deleteTask(id: number): Promise<void> {
  return api.delete<void>(`/api/tasks/${id}`);
}

/** Absolute URL for the SSE stream (EventSource can't use relative paths). */
export const TASK_STREAM_URL = `${
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
}/api/tasks/stream`;

export type TaskEventType = "CREATED" | "UPDATED" | "DELETED";

/** Real-time event pushed over SSE. `task` is null for DELETED. */
export interface TaskEvent {
  type: TaskEventType;
  taskId: number;
  task: Task | null;
  timestamp: string;
}
