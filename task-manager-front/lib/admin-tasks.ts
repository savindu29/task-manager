/**
 * Admin task types and constants. Maps to `/api/admin/tasks/*` (role ADMIN —
 * the backend enforces this; the frontend also gates the UI). The API calls
 * that use these live in `@/services/task.service`.
 */
import type { TaskStatus } from "@/lib/tasks";

export interface ListAllTasksParams {
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
