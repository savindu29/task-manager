"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import {
  formatStatus,
  TASK_STATUSES,
  type Task,
  type TaskEvent,
  type TaskStatus,
} from "@/lib/tasks";
import { ADMIN_TASK_STREAM_URL } from "@/lib/admin-tasks";
import {
  listAllTasks,
  updateAnyTask,
  deleteAnyTask,
} from "@/services/task.service";
import { useAuth } from "@/components/auth-provider";
import { useTaskStream } from "@/hooks/use-task-stream";
import { TaskViews } from "@/components/tasks/task-views";
import { TaskSheet } from "@/components/tasks/task-sheet";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

// Fetch a generous page so the grouped views show every user's tasks at once.
const PAGE_SIZE = 100;

type StatusFilter = "ALL" | TaskStatus;
interface Owner {
  name: string;
  email: string;
}

export default function AdminTasksPage() {
  const { user, status: authStatus } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [total, setTotal] = React.useState(0);
  const [owners, setOwners] = React.useState<Map<number, Owner>>(new Map());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [ownerFilter, setOwnerFilter] = React.useState<string>("ALL");
  const [editing, setEditing] = React.useState<Task | null>(null);

  const isAdmin = user?.role === "ADMIN";
  React.useEffect(() => {
    if (authStatus === "authenticated" && !isAdmin) router.replace("/my-task");
  }, [authStatus, isAdmin, router]);

  const mergeOwners = React.useCallback((items: Task[]) => {
    setOwners((prev) => {
      const next = new Map(prev);
      for (const t of items) {
        next.set(t.ownerId, { name: t.ownerName, email: t.ownerEmail });
      }
      return next;
    });
  }, []);

  const load = React.useCallback(
    async (status: StatusFilter, ownerId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listAllTasks({
          size: PAGE_SIZE,
          status: status === "ALL" ? undefined : status,
          ownerId: ownerId === "ALL" ? undefined : Number(ownerId),
        });
        setTasks(result.content);
        setTotal(result.pagination.totalElements);
        mergeOwners(result.content);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load tasks.",
        );
      } finally {
        setLoading(false);
      }
    },
    [mergeOwners],
  );

  React.useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    (async () => {
      try {
        const result = await listAllTasks({ size: PAGE_SIZE });
        if (!active) return;
        setTasks(result.content);
        setTotal(result.pagination.totalElements);
        mergeOwners(result.content);
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load tasks.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin, mergeOwners]);

  const upsert = React.useCallback(
    (task: Task) => {
      setTasks((prev) => {
        const without = prev.filter((t) => t.id !== task.id);
        const matchesStatus =
          statusFilter === "ALL" || task.status === statusFilter;
        const matchesOwner =
          ownerFilter === "ALL" || task.ownerId === Number(ownerFilter);
        return matchesStatus && matchesOwner ? [task, ...without] : without;
      });
    },
    [statusFilter, ownerFilter],
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
  useTaskStream(onStreamEvent, ADMIN_TASK_STREAM_URL);

  function changeStatus(next: StatusFilter) {
    setStatusFilter(next);
    void load(next, ownerFilter);
  }

  function changeOwner(next: string) {
    setOwnerFilter(next);
    void load(statusFilter, next);
  }

  const ownerOptions = React.useMemo(
    () =>
      Array.from(owners.entries())
        .map(([id, owner]) => ({ id, ...owner }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [owners],
  );

  const selectedOwner =
    ownerFilter === "ALL"
      ? null
      : (ownerOptions.find((o) => o.id === Number(ownerFilter)) ?? null);

  const visibleStatuses =
    statusFilter === "ALL" ? TASK_STATUSES : [statusFilter];

  if (authStatus !== "authenticated" || !isAdmin) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "task" : "tasks"} across all users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Combobox
            items={ownerOptions}
            value={selectedOwner}
            onValueChange={(owner) =>
              changeOwner(owner ? String(owner.id) : "ALL")
            }
            itemToStringLabel={(owner) => owner.name}
          >
            <ComboboxInput
              placeholder="All owners"
              showClear
              className="w-56"
              aria-label="Filter by owner"
            />
            <ComboboxContent>
              <ComboboxEmpty>No owners found.</ComboboxEmpty>
              <ComboboxList>
                {(owner) => (
                  <ComboboxItem key={owner.id} value={owner}>
                    <div className="flex flex-col">
                      <span>{owner.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {owner.email}
                      </span>
                    </div>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              changeStatus((value ?? "ALL") as StatusFilter)
            }
          >
            <SelectTrigger aria-label="Filter by status" className="w-40">
              <SelectValue>
                {statusFilter === "ALL"
                  ? "All statuses"
                  : formatStatus(statusFilter)}
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
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <TaskViews
          tasks={tasks}
          statuses={visibleStatuses}
          onEdit={setEditing}
          onUpdated={upsert}
          onDeleted={remove}
          updateFn={updateAnyTask}
          deleteFn={deleteAnyTask}
          showOwner
        />
      )}

      <TaskSheet
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        task={editing}
        onSaved={upsert}
        updateFn={updateAnyTask}
      />
    </div>
  );
}
