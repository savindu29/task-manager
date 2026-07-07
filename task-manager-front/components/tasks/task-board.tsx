"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  deleteTask,
  updateTask,
  formatStatus,
  STATUS_META,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

interface TaskBoardProps {
  tasks: Task[];
  /** Statuses (in order) to render as groups. */
  statuses: TaskStatus[];
  onEdit: (task: Task) => void;
  onAdd: (status: TaskStatus) => void;
  onUpdated: (task: Task) => void;
  onDeleted: (id: number) => void;
}

export function TaskBoard({
  tasks,
  statuses,
  onEdit,
  onAdd,
  onUpdated,
  onDeleted,
}: TaskBoardProps) {
  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const [toDelete, setToDelete] = React.useState<Task | null>(null);
  const [deleting, setDeleting] = React.useState(false);

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

  async function changeStatus(task: Task, status: TaskStatus) {
    if (status === task.status) return;
    setPendingId(task.id);
    try {
      const updated = await updateTask(task.id, {
        title: task.title,
        description: task.description ?? undefined,
        status,
        dueDate: task.dueDate,
      });
      onUpdated(updated);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to update task.",
      );
    } finally {
      setPendingId(null);
    }
  }

  function toggleDone(task: Task, done: boolean) {
    void changeStatus(task, done ? "DONE" : "TODO");
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteTask(toDelete.id);
      toast.success("Task deleted");
      onDeleted(toDelete.id);
      setToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to delete task.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {statuses.map((status) => {
        const items = grouped.get(status) ?? [];
        const meta = STATUS_META[status];

        return (
          <section key={status} className="flex flex-col gap-2">
            {/* Group header */}
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
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10" />
                    <TableHead className="w-[28%]">Task</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="w-44">Status</TableHead>
                    <TableHead className="w-36">Due date</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="py-6 text-center text-xs text-muted-foreground"
                      >
                        No tasks here yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((task) => (
                      <TableRow key={task.id} className="group/row">
                        <TableCell>
                          <Checkbox
                            checked={task.status === "DONE"}
                            disabled={pendingId === task.id}
                            onCheckedChange={(checked) =>
                              toggleDone(task, checked === true)
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
                        <TableCell>
                          <Select
                            value={task.status}
                            disabled={pendingId === task.id}
                            onValueChange={(value) =>
                              changeStatus(task, value as TaskStatus)
                            }
                          >
                            <SelectTrigger size="sm" className="w-36">
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  STATUS_META[task.status].dot,
                                )}
                              />
                              <SelectValue>
                                {formatStatus(task.status)}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {TASK_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  <span
                                    className={cn(
                                      "size-1.5 rounded-full",
                                      STATUS_META[s].dot,
                                    )}
                                  />
                                  {formatStatus(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(task.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="opacity-0 group-hover/row:opacity-100 data-popup-open:opacity-100"
                                />
                              }
                            >
                              <MoreHorizontal />
                              <span className="sr-only">Task actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Pencil />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setToDelete(task)}
                              >
                                <Trash2 />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <button
                type="button"
                onClick={() => onAdd(status)}
                className="flex w-full items-center gap-1.5 border-t px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Add task
              </button>
            </div>
          </section>
        );
      })}

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{toDelete?.title}&rdquo; will be permanently removed. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
