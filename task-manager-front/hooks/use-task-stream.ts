"use client";

import * as React from "react";

import { getToken } from "@/lib/auth-token";
import { TASK_STREAM_URL, type TaskEvent } from "@/lib/tasks";

/** Subscribe to the SSE task stream, calling `onEvent` per change; JWT passed as `?token=` (EventSource can't set headers). */
export function useTaskStream(
  onEvent: (event: TaskEvent) => void,
  url: string = TASK_STREAM_URL,
) {
  // Keep the latest callback without re-opening the connection each render.
  const handler = React.useRef(onEvent);
  React.useEffect(() => {
    handler.current = onEvent;
  });

  React.useEffect(() => {
    const token = getToken();
    const streamUrl = token
      ? `${url}?token=${encodeURIComponent(token)}`
      : url;
    const source = new EventSource(streamUrl, { withCredentials: true });

    source.addEventListener("task", (event) => {
      try {
        handler.current(JSON.parse((event as MessageEvent).data) as TaskEvent);
      } catch {
        // Ignore malformed frames.
      }
    });

    return () => source.close();
  }, [url]);
}
