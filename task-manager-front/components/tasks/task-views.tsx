"use client";

import * as React from "react";
import { Calendar, Columns3, GanttChart, Table2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskSpreadsheet } from "@/components/tasks/task-spreadsheet";
import { TaskBoardView } from "@/components/tasks/task-board-view";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import type { TaskViewProps } from "@/components/tasks/task-view-props";

type View = "spreadsheet" | "timeline" | "calendar" | "board";

const VIEW_TABS: { value: View; label: string; icon: React.ElementType }[] = [
  { value: "spreadsheet", label: "Spreadsheet", icon: Table2 },
  { value: "timeline", label: "Timeline", icon: GanttChart },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "board", label: "Board", icon: Columns3 },
];

/** Tabbed multi-view over the same task set: spreadsheet, timeline, calendar,
 *  board. Used by both the user (/my-task) and admin (/admin/tasks) pages. */
export function TaskViews(props: TaskViewProps) {
  const [view, setView] = React.useState<View>("spreadsheet");

  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as View)}
      className="gap-4"
    >
      <TabsList variant="line" className="w-fit">
        {VIEW_TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value}>
            <Icon />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="spreadsheet">
        <TaskSpreadsheet {...props} />
      </TabsContent>
      <TabsContent value="timeline">
        <TaskTimeline {...props} />
      </TabsContent>
      <TabsContent value="calendar">
        <TaskCalendar tasks={props.tasks} onEdit={props.onEdit} />
      </TabsContent>
      <TabsContent value="board">
        <TaskBoardView {...props} />
      </TabsContent>
    </Tabs>
  );
}
