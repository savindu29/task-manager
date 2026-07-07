"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  formatStatus,
  TASK_STATUSES,
  type Task,
  type TaskEvent,
  type TaskStatus,
} from "@/lib/tasks";
import { listTasks } from "@/services/task.service";
import { useTaskStream } from "@/hooks/use-task-stream";
import { TaskViews } from "@/components/tasks/task-views";
import { TaskSheet } from "@/components/tasks/task-sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// Fetch a generous page so the grouped views show everything at once.
const PAGE_SIZE = 100;

type Filter = "ALL" | TaskStatus;

export default function MyTasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("ALL");

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [createStatus, setCreateStatus] = React.useState<TaskStatus>("TODO");

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
            err instanceof ApiError ? err.message : "Failed to load your tasks.",
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

  const onStreamEvent = React.useCallback(
    (event: TaskEvent) => {
      if (event.type === "DELETED") remove(event.taskId);
      else if (event.task) upsert(event.task);
    },
    [remove, upsert],
  );
  useTaskStream(onStreamEvent);

  function changeFilter(next: Filter) {
    setFilter(next);
    void load(next);
  }

  function openCreate(status: TaskStatus) {
    setEditing(null);
    setCreateStatus(status);
    setSheetOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setSheetOpen(true);
  }

  const visibleStatuses = filter === "ALL" ? TASK_STATUSES : [filter];

  return (
    <div className="flex flex-col gap-4 p-6">
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
            onValueChange={(value) => changeFilter((value ?? "ALL") as Filter)}
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
        <TaskViews
          tasks={tasks}
          statuses={visibleStatuses}
          onEdit={openEdit}
          onAdd={openCreate}
          onUpdated={upsert}
          onDeleted={remove}
        />
      )}

      <TaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={editing}
        defaultStatus={createStatus}
        onSaved={upsert}
      />
    </div>
  );
}
