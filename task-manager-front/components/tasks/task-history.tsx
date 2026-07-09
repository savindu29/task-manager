"use client";

import * as React from "react";

import { formatStatus, type Task, type TaskHistoryEntry } from "@/lib/tasks";
import { getTaskHistory } from "@/services/task.service";
import { Spinner } from "@/components/ui/spinner";

interface TaskHistoryProps {
  task: Task;
  /** Fetcher for the change log; admin views pass the /api/admin/tasks variant. */
  fetchHistory?: (id: number) => Promise<TaskHistoryEntry[]>;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Render a stored field value (status codes prettified, dates formatted). */
function renderValue(field: string | null, value: string | null): string {
  if (value == null || value === "") return "—";
  if (field === "Status") return formatStatus(value);
  if (field === "Due date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, { dateStyle: "medium" });
  }
  return value;
}

/** Created/updated timestamps + a timeline of recorded changes for a task. */
export function TaskHistory({ task, fetchHistory = getTaskHistory }: TaskHistoryProps) {
  const [entries, setEntries] = React.useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    // Mounts fresh per task (the sheet keys the form by task id), so initial
    // state already reflects "loading" — no synchronous reset needed here.
    let active = true;
    fetchHistory(task.id)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [task.id, fetchHistory]);

  return (
    <section className="mt-2 border-t pt-4">
      <h3 className="text-sm font-medium">History</h3>

      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <dt>Created</dt>
        <dd className="text-foreground">{formatDateTime(task.createdAt)}</dd>
        <dt>Last updated</dt>
        <dd className="text-foreground">{formatDateTime(task.updatedAt)}</dd>
      </dl>

      <div className="mt-3">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3.5" />
            Loading history…
          </div>
        ) : error ? (
          <p className="text-xs text-muted-foreground">Couldn&apos;t load history.</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No changes recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 pl-3 text-xs">
                <span className="font-medium">
                  {entry.action === "CREATED"
                    ? "Task created"
                    : `${entry.field}: ${renderValue(entry.field, entry.oldValue)} → ${renderValue(entry.field, entry.newValue)}`}
                </span>
                <span className="text-muted-foreground">
                  {entry.changedBy ? `${entry.changedBy} · ` : ""}
                  {formatDateTime(entry.changedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
