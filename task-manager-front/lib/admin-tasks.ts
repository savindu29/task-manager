/** Admin task types/constants for `/api/admin/tasks/*` (backend enforces ADMIN role). */
import type { TaskDateFilters, TaskStatus } from "@/lib/tasks";

export interface ListAllTasksParams extends TaskDateFilters {
  status?: TaskStatus;
  ownerId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

/** SSE stream of changes to ALL tasks (admin scope). */
export const ADMIN_TASK_STREAM_URL = `${
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
}/api/admin/tasks/stream`;
