"use client";

import { cn } from "@/lib/utils";
import {
  formatStatus,
  STATUS_META,
  TASK_STATUSES,
  type TaskStatus,
} from "@/lib/tasks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
}

/** Inline status picker with a coloured dot, shared across task views. */
export function StatusSelect({
  value,
  onChange,
  disabled,
  size = "sm",
  className,
}: StatusSelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => next && onChange(next as TaskStatus)}
    >
      <SelectTrigger size={size} className={cn("w-36", className)}>
        <span className={cn("size-1.5 rounded-full", STATUS_META[value].dot)} />
        <SelectValue>{formatStatus(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className={cn("size-1.5 rounded-full", STATUS_META[s].dot)} />
            {formatStatus(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
