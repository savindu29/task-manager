"use client";

import * as React from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { type Task, type TaskStatus } from "@/lib/tasks";
import { deleteTask, updateTask } from "@/services/task.service";
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

interface Options {
  onUpdated: (task: Task) => void;
  onDeleted: (id: number) => void;
  /** Endpoint overrides; admin views pass the /api/admin/tasks equivalents. */
  updateFn?: (
    id: number,
    input: {
      title: string;
      description?: string;
      status: TaskStatus;
      dueDate: string;
    },
  ) => Promise<Task>;
  deleteFn?: (id: number) => Promise<void>;
}

/** Shared task-row actions (change status, delete-with-confirm); returns the dialog to render once. */
export function useTaskRowActions({
  onUpdated,
  onDeleted,
  updateFn = updateTask,
  deleteFn = deleteTask,
}: Options) {
  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const [toDelete, setToDelete] = React.useState<Task | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const changeStatus = React.useCallback(
    async (task: Task, status: TaskStatus) => {
      if (status === task.status) return;
      setPendingId(task.id);
      try {
        const updated = await updateFn(task.id, {
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
    },
    [onUpdated, updateFn],
  );

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteFn(toDelete.id);
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

  const deleteDialog = (
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
  );

  return {
    pendingId,
    changeStatus,
    requestDelete: setToDelete,
    deleteDialog,
  };
}
