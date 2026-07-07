"use client";

import * as React from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import {
  createTask,
  updateTask,
  formatStatus,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this task; otherwise it creates a new one. */
  task?: Task | null;
  /** Pre-selected status when creating (e.g. from a group's "Add task"). */
  defaultStatus?: TaskStatus;
  /** Called with the created/updated task after a successful save. */
  onSaved: (task: Task) => void;
}

/** Convert an ISO instant to the yyyy-mm-dd value a date input expects. */
function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  onSaved,
}: TaskDialogProps) {
  const isEdit = Boolean(task);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of your task."
              : "Add a task to your list."}
          </DialogDescription>
        </DialogHeader>

        {/* Keyed + mounted only while open, so each open starts from fresh
            initial values without a state-syncing effect. */}
        {open && (
          <TaskForm
            key={task?.id ?? "new"}
            task={task ?? null}
            defaultStatus={defaultStatus}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormProps {
  task: Task | null;
  defaultStatus?: TaskStatus;
  onSaved: (task: Task) => void;
  onClose: () => void;
}

function TaskForm({ task, defaultStatus, onSaved, onClose }: TaskFormProps) {
  const isEdit = Boolean(task);

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(
    task?.description ?? "",
  );
  const [status, setStatus] = React.useState<TaskStatus>(
    task?.status ?? defaultStatus ?? "TODO",
  );
  const [dueDate, setDueDate] = React.useState(toDateInput(task?.dueDate));
  const [submitting, setSubmitting] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFieldErrors({});
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : "",
    };

    try {
      const saved =
        isEdit && task
          ? await updateTask(task.id, payload)
          : await createTask(payload);
      toast.success(isEdit ? "Task updated" : "Task created");
      onSaved(saved);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors);
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        id="task-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design the dashboard"
            maxLength={150}
            required
            autoFocus
            aria-invalid={Boolean(fieldErrors.title)}
          />
          <FieldError errors={[{ message: fieldErrors.title }]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more detail (optional)"
            maxLength={2000}
            rows={3}
            aria-invalid={Boolean(fieldErrors.description)}
          />
          <FieldError errors={[{ message: fieldErrors.description }]} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue>{formatStatus(status)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              aria-invalid={Boolean(fieldErrors.dueDate)}
            />
            <FieldError errors={[{ message: fieldErrors.dueDate }]} />
          </Field>
        </div>
      </form>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" form="task-form" disabled={submitting}>
          {submitting && <Spinner className="size-3.5" />}
          {isEdit ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </>
  );
}
