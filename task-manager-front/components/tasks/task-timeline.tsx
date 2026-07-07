"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { type Task } from "@/lib/tasks";
import { useTaskRowActions } from "@/hooks/use-task-row-actions";
import { StatusSelect } from "@/components/tasks/status-select";
import { TaskDeleteButton } from "@/components/tasks/task-delete-button";
import { OwnerAvatar } from "@/components/tasks/owner-avatar";
import type { TaskViewProps } from "@/components/tasks/task-view-props";

const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Parse a YYYY-MM-DD key as a local date (avoids UTC weekday drift). */
function formatDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return fullDateFormatter.format(new Date(y, m - 1, d));
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

/** Chronological timeline grouped by due date. */
export function TaskTimeline({
  tasks,
  onEdit,
  onUpdated,
  onDeleted,
  updateFn,
  deleteFn,
  showOwner,
}: TaskViewProps) {
  const { pendingId, changeStatus, requestDelete, deleteDialog } =
    useTaskRowActions({ onUpdated, onDeleted, updateFn, deleteFn });

  const groups = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = task.dueDate.slice(0, 10);
      const list = map.get(key);
      if (list) list.push(task);
      else map.set(key, [task]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tasks]);

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
        No tasks to show on the timeline.
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6 pl-6">
      <div className="absolute top-2 bottom-2 left-[7px] w-px bg-border" />

      {groups.map(([dateKey, items]) => (
        <div key={dateKey} className="relative">
          <span className="absolute top-1 -left-[1.4rem] size-3.5 rounded-full border-2 border-background bg-blue-600" />
          <h3 className="text-sm font-medium">{formatDateKey(dateKey)}</h3>

          <div className="mt-2 flex flex-col gap-2">
            {items.map((task) => (
              <div
                key={task.id}
                onClick={() => onEdit(task)}
                className="group/row flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      task.status === "DONE" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>
                {showOwner && (
                  <OwnerAvatar id={task.ownerId} name={task.ownerName} />
                )}
                <span onClick={stop}>
                  <StatusSelect
                    value={task.status}
                    disabled={pendingId === task.id}
                    onChange={(s) => changeStatus(task, s)}
                  />
                </span>
                <span onClick={stop}>
                  <TaskDeleteButton task={task} onDelete={requestDelete} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {deleteDialog}
    </div>
  );
}
