/** Task API calls for USER (`/api/tasks/*`) and ADMIN (`/api/admin/tasks/*`) scopes; types live in `@/lib/tasks`. */
import { api } from "@/lib/api";
import type {
  CreateTaskInput,
  ListTasksParams,
  Paginated,
  Task,
  TaskHistoryEntry,
  UpdateTaskInput,
} from "@/lib/tasks";
import type { ListAllTasksParams } from "@/lib/admin-tasks";

// ============================================================
// USER — own tasks only
// ============================================================

/** Paginated list of the current user's tasks, optionally filtered by status. */
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

/** Change history for one of the current user's tasks (newest first). */
export function getTaskHistory(id: number): Promise<TaskHistoryEntry[]> {
  return api.get<TaskHistoryEntry[]>(`/api/tasks/${id}/history`);
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

/** Change history for any task (admin scope, newest first). */
export function getAnyTaskHistory(id: number): Promise<TaskHistoryEntry[]> {
  return api.get<TaskHistoryEntry[]>(`/api/admin/tasks/${id}/history`);
}
