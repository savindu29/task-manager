"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  formatStatus,
  TASK_STATUSES,
  type PageMeta,
  type Task,
  type TaskDateFilters,
  type TaskEvent,
  type TaskStatus,
} from "@/lib/tasks";
import { ADMIN_TASK_STREAM_URL } from "@/lib/admin-tasks";
import {
  listAllTasks,
  updateAnyTask,
  deleteAnyTask,
  getAnyTaskHistory,
} from "@/services/task.service";
import { useAuth } from "@/components/auth-provider";
import { useTaskStream } from "@/hooks/use-task-stream";
import { TaskViews } from "@/components/tasks/task-views";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskSheet } from "@/components/tasks/task-sheet";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 20;

type StatusFilter = "ALL" | TaskStatus;
interface Owner {
  name: string;
  email: string;
}

export default function AdminTasksPage() {
  const { user, status: authStatus } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [pageMeta, setPageMeta] = React.useState<PageMeta | null>(null);
  const [owners, setOwners] = React.useState<Map<number, Owner>>(new Map());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL");
  const [ownerFilter, setOwnerFilter] = React.useState<string>("ALL");
  const [advanced, setAdvanced] = React.useState<TaskDateFilters>({});
  const [page, setPage] = React.useState(0);
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
    async (
      nextPage: number,
      status: StatusFilter,
      ownerId: string,
      adv: TaskDateFilters = {},
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listAllTasks({
          page: nextPage,
          size: PAGE_SIZE,
          status: status === "ALL" ? undefined : status,
          ownerId: ownerId === "ALL" ? undefined : Number(ownerId),
          ...adv,
        });
        setTasks(result.content);
        setPageMeta(result.pagination);
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
        const result = await listAllTasks({ page: 0, size: PAGE_SIZE });
        if (!active) return;
        setTasks(result.content);
        setPageMeta(result.pagination);
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

  const patch = React.useCallback(
    (task: Task) => {
      setTasks((prev) => {
        if (!prev.some((t) => t.id === task.id)) return prev;
        const matchesStatus =
          statusFilter === "ALL" || task.status === statusFilter;
        const matchesOwner =
          ownerFilter === "ALL" || task.ownerId === Number(ownerFilter);
        return matchesStatus && matchesOwner
          ? prev.map((t) => (t.id === task.id ? task : t))
          : prev.filter((t) => t.id !== task.id);
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
      else if (event.task) patch(event.task);
    },
    [remove, patch],
  );
  useTaskStream(onStreamEvent, ADMIN_TASK_STREAM_URL);

  function changeStatus(next: StatusFilter) {
    setStatusFilter(next);
    setPage(0);
    void load(0, next, ownerFilter, advanced);
  }

  function changeOwner(next: string) {
    setOwnerFilter(next);
    setPage(0);
    void load(0, statusFilter, next, advanced);
  }

  function goToPage(next: number) {
    setPage(next);
    void load(next, statusFilter, ownerFilter, advanced);
  }

  function applyFilters(next: TaskDateFilters) {
    setAdvanced(next);
    setPage(0);
    void load(0, statusFilter, ownerFilter, next);
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
  const total = pageMeta?.totalElements ?? 0;

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

      <TaskFilters onApply={applyFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            onClick={() => load(page, statusFilter, ownerFilter, advanced)}
          >
            Try again
          </Button>
        </div>
      ) : (
        <>
          <TaskViews
            tasks={tasks}
            statuses={visibleStatuses}
            onEdit={setEditing}
            onUpdated={patch}
            onDeleted={remove}
            updateFn={updateAnyTask}
            deleteFn={deleteAnyTask}
            showOwner
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
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        task={editing}
        onSaved={patch}
        updateFn={updateAnyTask}
        historyFn={getAnyTaskHistory}
      />
    </div>
  );
}
