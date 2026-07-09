"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import type { TaskDateFilters } from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** yyyy-mm-dd -> ISO instant at the start of that day (local), or undefined. */
function dayStartIso(date: string): string | undefined {
  return date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
}

/** yyyy-mm-dd -> ISO instant at the end of that day (local), or undefined. */
function dayEndIso(date: string): string | undefined {
  return date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined;
}

interface TaskFiltersProps {
  /** Called with API-ready ISO filters when Apply/Clear is pressed. */
  onApply: (filters: TaskDateFilters) => void;
}

/** Keyword + created/due date-range filter bar. */
export function TaskFilters({ onApply }: TaskFiltersProps) {
  const [keyword, setKeyword] = React.useState("");
  const [createdFrom, setCreatedFrom] = React.useState("");
  const [createdTo, setCreatedTo] = React.useState("");
  const [dueFrom, setDueFrom] = React.useState("");
  const [dueTo, setDueTo] = React.useState("");

  const dirty =
    keyword || createdFrom || createdTo || dueFrom || dueTo ? true : false;

  function apply() {
    onApply({
      keyword: keyword.trim() || undefined,
      createdFrom: dayStartIso(createdFrom),
      createdTo: dayEndIso(createdTo),
      dueFrom: dayStartIso(dueFrom),
      dueTo: dayEndIso(dueTo),
    });
  }

  function clear() {
    setKeyword("");
    setCreatedFrom("");
    setCreatedTo("");
    setDueFrom("");
    setDueTo("");
    onApply({});
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
      <Field label="Search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Title or description"
            className="h-8 w-48 pl-7"
          />
        </div>
      </Field>

      <Field label="Created from">
        <DateInput value={createdFrom} onChange={setCreatedFrom} />
      </Field>
      <Field label="Created to">
        <DateInput value={createdTo} onChange={setCreatedTo} />
      </Field>
      <Field label="Due from">
        <DateInput value={dueFrom} onChange={setDueFrom} />
      </Field>
      <Field label="Due to">
        <DateInput value={dueTo} onChange={setDueTo} />
      </Field>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={apply}>
          Apply
        </Button>
        <Button size="sm" variant="outline" onClick={clear} disabled={!dirty}>
          <X className="size-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-36"
    />
  );
}
