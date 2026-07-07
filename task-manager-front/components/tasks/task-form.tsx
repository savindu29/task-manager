"use client";

import * as React from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import {
  formatStatus,
  TASK_STATUSES,
  type CreateTaskInput,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
} from "@/lib/tasks";
import { createTask, updateTask } from "@/services/task.service";
import { Button } from "@/components/ui/button";
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

const FORM_ID = "task-form";

/** Convert an ISO instant to the yyyy-mm-dd value a date input expects. */
function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

export interface TaskFormProps {
  task: Task | null;
  defaultStatus?: TaskStatus;
  onSaved: (task: Task) => void;
  onClose: () => void;
  createFn?: (input: CreateTaskInput) => Promise<Task>;
  updateFn?: (id: number, input: UpdateTaskInput) => Promise<Task>;
}

/**
 * Create/edit task form. Presentational shell (header/footer chrome) is
 * supplied by the container — here we render the scrollable fields plus a
 * pinned footer with the save/cancel actions.
 */
export function TaskForm({
  task,
  defaultStatus,
  onSaved,
  onClose,
  createFn = createTask,
  updateFn = updateTask,
}: TaskFormProps) {
  const isEdit = Boolean(task);

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
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
          ? await updateFn(task.id, payload)
          : await createFn(payload);
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
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-6"
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
            rows={5}
            aria-invalid={Boolean(fieldErrors.description)}
          />
          <FieldError errors={[{ message: fieldErrors.description }]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) => value && setStatus(value as TaskStatus)}
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
      </form>

      <div className="flex justify-end gap-2 border-t p-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} disabled={submitting}>
          {submitting && <Spinner className="size-3.5" />}
          {isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </>
  );
}
