"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatStatus, STATUS_META, type Task, type TaskStatus } from "@/lib/tasks";
import { useTaskRowActions } from "@/hooks/use-task-row-actions";
import { StatusSelect } from "@/components/tasks/status-select";
import { TaskDeleteButton } from "@/components/tasks/task-delete-button";
import { OwnerAvatar } from "@/components/tasks/owner-avatar";
import type { TaskViewProps } from "@/components/tasks/task-view-props";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

/** Kanban board — one column per status; move a task by changing its status. */
export function TaskBoardView({
  tasks,
  statuses,
  onEdit,
  onAdd,
  onUpdated,
  onDeleted,
  updateFn,
  deleteFn,
  showOwner,
}: TaskViewProps) {
  const { pendingId, changeStatus, requestDelete, deleteDialog } =
    useTaskRowActions({ onUpdated, onDeleted, updateFn, deleteFn });

  const grouped = React.useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const status of statuses) map.set(status, []);
    for (const task of tasks) {
      if (map.has(task.status)) map.get(task.status)!.push(task);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return map;
  }, [tasks, statuses]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {statuses.map((status) => {
        const items = grouped.get(status) ?? [];
        const meta = STATUS_META[status];

        return (
          <section
            key={status}
            className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-muted/40 p-2"
          >
            <div className="flex items-center justify-between px-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                  meta.pill,
                )}
              >
                <span className={cn("size-1.5 rounded-full", meta.dot)} />
                {formatStatus(status)}
                <span className="text-muted-foreground">{items.length}</span>
              </span>
              {onAdd && (
                <button
                  type="button"
                  onClick={() => onAdd(status)}
                  title="Add task"
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {items.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onEdit(task)}
                  className="group/card cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        task.status === "DONE" &&
                          "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </span>
                    <span onClick={stop}>
                      <TaskDeleteButton
                        task={task}
                        onDelete={requestDelete}
                        className="-mt-1 -mr-1"
                      />
                    </span>
                  </div>
                  {task.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {showOwner && (
                        <OwnerAvatar
                          id={task.ownerId}
                          name={task.ownerName}
                          className="size-5"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <span onClick={stop}>
                      <StatusSelect
                        value={task.status}
                        disabled={pendingId === task.id}
                        onChange={(s) => changeStatus(task, s)}
                        className="w-32"
                      />
                    </span>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              )}
            </div>
          </section>
        );
      })}

      {deleteDialog}
    </div>
  );
}
