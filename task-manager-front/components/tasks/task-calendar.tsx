"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { STATUS_META, type Task } from "@/lib/tasks";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CELLS = 42; // 6 weeks

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface TaskCalendarProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

/** Month grid placing tasks on their due date. Click a task to edit it. */
export function TaskCalendar({ tasks, onEdit }: TaskCalendarProps) {
  const [view, setView] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const todayKey = React.useMemo(() => toKey(new Date()), []);

  // Group tasks by their due date (calendar day), matching the picked date.
  const byDay = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = task.dueDate.slice(0, 10);
      const list = map.get(key);
      if (list) list.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [tasks]);

  const cells = React.useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const start = new Date(view.year, view.month, 1 - first.getDay());
    return Array.from({ length: CELLS }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [view]);

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );

  function shiftMonth(delta: number) {
    setView((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    const now = new Date();
    setView({ year: now.getFullYear(), month: now.getMonth() });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const key = toKey(date);
            const inMonth = date.getMonth() === view.month;
            const dayTasks = byDay.get(key) ?? [];
            const isToday = key === todayKey;

            return (
              <div
                key={i}
                className={cn(
                  "min-h-24 border-r border-b p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                  !inMonth && "bg-muted/20",
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    inMonth ? "text-foreground" : "text-muted-foreground/50",
                    isToday && "bg-blue-600 font-medium text-white",
                  )}
                >
                  {date.getDate()}
                </div>
                <div className="flex flex-col gap-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onEdit(task)}
                      title={task.title}
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-left text-xs transition-colors hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          STATUS_META[task.status].dot,
                        )}
                      />
                      <span
                        className={cn(
                          "truncate",
                          task.status === "DONE" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </span>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="px-1 text-xs text-muted-foreground">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
