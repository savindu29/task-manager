"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  listTasks,
  formatStatus,
  TASK_STATUSES,
  type Task,
  type TaskEvent,
  type TaskStatus,
} from "@/lib/tasks";
import { useTaskStream } from "@/hooks/use-task-stream";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// Fetch a generous page so the grouped view shows everything at once.
const PAGE_SIZE = 100;

type Filter = "ALL" | TaskStatus;

export default function MyTasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("ALL");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [createStatus, setCreateStatus] = React.useState<TaskStatus>("TODO");

  // Shared loader for user-initiated fetches (filter change, retry). Setting
  // the loading flag synchronously here is fine — these run in event handlers.
  const load = React.useCallback(async (current: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTasks({
        status: current === "ALL" ? undefined : current,
        size: PAGE_SIZE,
      });
      setTasks(result.content);
      setTotal(result.pagination.totalElements);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load your tasks.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount only. Inlined (state set post-await) so it doesn't
  // trip the "no synchronous setState in effect" rule; subsequent loads are
  // driven by handlers via `changeFilter`/retry.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await listTasks({ size: PAGE_SIZE });
        if (active) {
          setTasks(result.content);
          setTotal(result.pagination.totalElements);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Failed to load your tasks.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function changeFilter(next: Filter) {
    setFilter(next);
    void load(next);
  }

  // Idempotent upsert/remove so our own optimistic updates and real-time
  // events can't create duplicates. Respects the active status filter.
  const upsert = React.useCallback(
    (task: Task) => {
      setTasks((prev) => {
        const without = prev.filter((t) => t.id !== task.id);
        const matchesFilter = filter === "ALL" || task.status === filter;
        return matchesFilter ? [task, ...without] : without;
      });
    },
    [filter],
  );

  const remove = React.useCallback((id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Real-time updates (also covers changes from other tabs/devices).
  const onStreamEvent = React.useCallback(
    (event: TaskEvent) => {
      if (event.type === "DELETED") {
        remove(event.taskId);
      } else if (event.task) {
        upsert(event.task);
      }
    },
    [remove, upsert],
  );
  useTaskStream(onStreamEvent);

  function openCreate(status: TaskStatus) {
    setEditing(null);
    setCreateStatus(status);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  const visibleStatuses = filter === "ALL" ? TASK_STATUSES : [filter];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "task" : "tasks"} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(value) => changeFilter(value as Filter)}
          >
            <SelectTrigger aria-label="Filter by status" className="w-40">
              <SelectValue>
                {filter === "ALL" ? "All statuses" : formatStatus(filter)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => openCreate("TODO")}>
            <Plus />
            New task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => load(filter)}>
            Try again
          </Button>
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          statuses={visibleStatuses}
          onEdit={openEdit}
          onAdd={openCreate}
          onUpdated={upsert}
          onDeleted={remove}
        />
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        defaultStatus={createStatus}
        onSaved={upsert}
      />
    </div>
  );
}
