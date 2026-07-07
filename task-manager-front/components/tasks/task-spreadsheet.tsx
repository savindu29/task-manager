"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatStatus, STATUS_META, type Task, type TaskStatus } from "@/lib/tasks";
import { useTaskRowActions } from "@/hooks/use-task-row-actions";
import { StatusSelect } from "@/components/tasks/status-select";
import { TaskDeleteButton } from "@/components/tasks/task-delete-button";
import { OwnerAvatar } from "@/components/tasks/owner-avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TaskViewProps } from "@/components/tasks/task-view-props";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

/** Stop a click on interactive cells from opening the task sheet. */
function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

/** Grouped, spreadsheet-style table — one section per status. */
export function TaskSpreadsheet({
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

  const colSpan = showOwner ? 7 : 6;

  return (
    <div className="flex flex-col gap-8">
      {statuses.map((status) => {
        const items = grouped.get(status) ?? [];
        const meta = STATUS_META[status];

        return (
          <section key={status} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                  meta.pill,
                )}
              >
                <span className={cn("size-1.5 rounded-full", meta.dot)} />
                {formatStatus(status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <Table className="table-fixed min-w-[760px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10" />
                    <TableHead className={showOwner ? "w-[22%]" : "w-[28%]"}>
                      Task
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    {showOwner && <TableHead className="w-48">Owner</TableHead>}
                    <TableHead className="w-44">Status</TableHead>
                    <TableHead className="w-36">Due date</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={colSpan}
                        className="py-6 text-center text-xs text-muted-foreground"
                      >
                        No tasks here yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((task) => (
                      <TableRow
                        key={task.id}
                        onClick={() => onEdit(task)}
                        className="group/row cursor-pointer"
                      >
                        <TableCell onClick={stop}>
                          <Checkbox
                            checked={task.status === "DONE"}
                            disabled={pendingId === task.id}
                            onCheckedChange={(checked) =>
                              changeStatus(
                                task,
                                checked === true ? "DONE" : "TODO",
                              )
                            }
                            aria-label={
                              task.status === "DONE"
                                ? "Mark as to do"
                                : "Mark as done"
                            }
                          />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "truncate font-medium",
                            task.status === "DONE" &&
                              "text-muted-foreground line-through",
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </TableCell>
                        <TableCell
                          className="hidden truncate text-muted-foreground md:table-cell"
                          title={task.description ?? undefined}
                        >
                          {task.description || "—"}
                        </TableCell>
                        {showOwner && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <OwnerAvatar
                                id={task.ownerId}
                                name={task.ownerName}
                              />
                              <span className="truncate text-muted-foreground">
                                {task.ownerName}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell onClick={stop}>
                          <StatusSelect
                            value={task.status}
                            disabled={pendingId === task.id}
                            onChange={(s) => changeStatus(task, s)}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(task.dueDate)}
                        </TableCell>
                        <TableCell className="text-right" onClick={stop}>
                          <TaskDeleteButton
                            task={task}
                            onDelete={requestDelete}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                </Table>
              </div>

              {onAdd && (
                <button
                  type="button"
                  onClick={() => onAdd(status)}
                  className="flex w-full items-center gap-1.5 border-t px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Add task
                </button>
              )}
            </div>
          </section>
        );
      })}

      {deleteDialog}
    </div>
  );
}
