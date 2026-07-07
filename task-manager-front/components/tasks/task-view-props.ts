import type { Task, TaskStatus, UpdateTaskInput } from "@/lib/tasks";

/** Common props shared by every task view (spreadsheet, board, timeline). */
export interface TaskViewProps {
  tasks: Task[];
  statuses: TaskStatus[];
  /** Open a task for editing (row/card click). */
  onEdit: (task: Task) => void;
  /** Create a task in the given status; omit to hide "Add task" affordances. */
  onAdd?: (status: TaskStatus) => void;
  onUpdated: (task: Task) => void;
  onDeleted: (id: number) => void;
  /** Endpoint overrides (admin passes the /api/admin/tasks equivalents). */
  updateFn?: (id: number, input: UpdateTaskInput) => Promise<Task>;
  deleteFn?: (id: number) => Promise<void>;
  /** Show the task owner (admin views). */
  showOwner?: boolean;
}
