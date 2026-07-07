/**
 * Task API calls. Two scopes:
 *   - USER  — `/api/tasks/*`, scoped server-side to the caller's own tasks
 *             (owner comes from the auth principal, never the client);
 *   - ADMIN — `/api/admin/tasks/*`, view/manage every user's tasks (the backend
 *             enforces the role; the frontend also gates the UI).
 *
 * Each call returns the unwrapped payload or throws {@link ApiError}. Types and
 * UI helpers live in `@/lib/tasks` (and `ListAllTasksParams` in
 * `@/lib/admin-tasks`); the SSE stream URLs live alongside those types.
 */
import { api } from "@/lib/api";
import type {
  CreateTaskInput,
  ListTasksParams,
  Paginated,
  Task,
  UpdateTaskInput,
} from "@/lib/tasks";
import type { ListAllTasksParams } from "@/lib/admin-tasks";

// ============================================================
// USER — own tasks only
// ============================================================

/**
 * Paginated list of the current user's tasks, optionally filtered by status.
 * axios serialises `params` into the query string and omits null/undefined
 * values, so unset filters simply don't appear.
 */
export function listTasks(
  params: ListTasksParams = {},
): Promise<Paginated<Task>> {
  return api.get<Paginated<Task>>("/api/tasks", { params });
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

// ============================================================
// ADMIN — all tasks
// ============================================================

/** Paginated list of every user's tasks, filterable by status and owner. */
export function listAllTasks(
  params: ListAllTasksParams = {},
): Promise<Paginated<Task>> {
  return api.get<Paginated<Task>>("/api/admin/tasks", { params });
}

export function getAnyTask(id: number): Promise<Task> {
  return api.get<Task>(`/api/admin/tasks/${id}`);
}

export function updateAnyTask(
  id: number,
  input: UpdateTaskInput,
): Promise<Task> {
  return api.put<Task>(`/api/admin/tasks/${id}`, input);
}

export function deleteAnyTask(id: number): Promise<void> {
  return api.delete<void>(`/api/admin/tasks/${id}`);
}
