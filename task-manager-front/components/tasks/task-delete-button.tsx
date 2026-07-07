"use client";

import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Task } from "@/lib/tasks";
import { Button } from "@/components/ui/button";

interface TaskDeleteButtonProps {
  task: Task;
  onDelete: (task: Task) => void;
  className?: string;
}

/** Direct red delete action shown in a task row/card (opens a confirm). */
export function TaskDeleteButton({
  task,
  onDelete,
  className,
}: TaskDeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onDelete(task)}
      className={cn(
        "text-destructive hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
    >
      <Trash2 />
      Delete
    </Button>
  );
}
