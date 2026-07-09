"use client";

import {
  type CreateTaskInput,
  type Task,
  type TaskHistoryEntry,
  type TaskStatus,
  type UpdateTaskInput,
} from "@/lib/tasks";
import { TaskForm } from "@/components/tasks/task-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, edits this task; otherwise creates a new one. */
  task?: Task | null;
  /** Pre-selected status when creating. */
  defaultStatus?: TaskStatus;
  onSaved: (task: Task) => void;
  createFn?: (input: CreateTaskInput) => Promise<Task>;
  updateFn?: (id: number, input: UpdateTaskInput) => Promise<Task>;
  historyFn?: (id: number) => Promise<TaskHistoryEntry[]>;
}

/** Right-hand panel for viewing/editing (or creating) a task. */
export function TaskSheet({
  open,
  onOpenChange,
  task,
  defaultStatus,
  onSaved,
  createFn,
  updateFn,
  historyFn,
}: TaskSheetProps) {
  const isEdit = Boolean(task);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{isEdit ? "Task details" : "New task"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Edit the details of this task."
              : "Add a task to your list."}
          </SheetDescription>
        </SheetHeader>

        {/* Keyed + mounted only while open, so each open starts fresh. */}
        {open && (
          <TaskForm
            key={task?.id ?? "new"}
            task={task ?? null}
            defaultStatus={defaultStatus}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
            createFn={createFn}
            updateFn={updateFn}
            historyFn={historyFn}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
