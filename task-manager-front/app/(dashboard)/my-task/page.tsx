"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  formatStatus,
  TASK_STATUSES,
  type PageMeta,
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

const PAGE_SIZE = 20;

type Filter = "ALL" | TaskStatus;

export default function MyTasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [pageMeta, setPageMeta] = React.useState<PageMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [filter, setFilter] = React.useState<Filter>("ALL");
  const [page, setPage] = React.useState(0);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [createStatus, setCreateStatus] = React.useState<TaskStatus>("TODO");

  const load = React.useCallback(async (nextPage: number, current: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTasks({
        status: current === "ALL" ? undefined : current,
        page: nextPage,
        size: PAGE_SIZE,
      });
      setTasks(result.content);
      setPageMeta(result.pagination);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load your tasks.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load (state set post-await, so no synchronous setState in effect).
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await listTasks({ page: 0, size: PAGE_SIZE });
        if (active) {
          setTasks(result.content);
          setPageMeta(result.pagination);
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

  const reload = React.useCallback(
    () => load(page, filter),
    [load, page, filter],
  );

  // Replace an updated task in place; drop it if it no longer matches the
  // active status filter (e.g. status changed away from the filtered value).
  const patch = React.useCallback(
    (task: Task) => {
      setTasks((prev) => {
        if (!prev.some((t) => t.id === task.id)) return prev;
        const matches = filter === "ALL" || task.status === filter;
        return matches
          ? prev.map((t) => (t.id === task.id ? task : t))
          : prev.filter((t) => t.id !== task.id);
      });
    },
    [filter],
  );

  const remove = React.useCallback((id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Real-time (also covers other tabs/devices): reflect edits/deletes to tasks
  // on the current page. New tasks show on refetch / next page.
  const onStreamEvent = React.useCallback(
    (event: TaskEvent) => {
      if (event.type === "DELETED") remove(event.taskId);
      else if (event.task) patch(event.task);
    },
    [remove, patch],
  );
  useTaskStream(onStreamEvent);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(0);
    void load(0, next);
  }

  function goToPage(next: number) {
    setPage(next);
    void load(next, filter);
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

  // After save: edits patch in place; a newly created task may belong on
  // another page, so reload the current page to keep counts/pages correct.
  function handleSaved(task: Task) {
    if (editing) patch(task);
    else void reload();
  }

  const visibleStatuses = filter === "ALL" ? TASK_STATUSES : [filter];
  const total = pageMeta?.totalElements ?? 0;

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
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <TaskViews
            tasks={tasks}
            statuses={visibleStatuses}
            onEdit={openEdit}
            onAdd={openCreate}
            onUpdated={patch}
            onDeleted={remove}
          />

          {pageMeta && pageMeta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Page {pageMeta.currentPage + 1} of {pageMeta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pageMeta.hasPrevious}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pageMeta.hasNext}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        task={editing}
        defaultStatus={createStatus}
        onSaved={handleSaved}
      />
    </div>
  );
}
