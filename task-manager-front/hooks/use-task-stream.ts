"use client";

import * as React from "react";

import { TASK_STREAM_URL, type TaskEvent } from "@/lib/tasks";

/**
 * Subscribe to the server-sent task stream and invoke `onEvent` for every
 * real-time change to the current user's tasks. The connection is opened once
 * on mount and closed on unmount; the browser's EventSource auto-reconnects.
 *
 * `withCredentials` is required so the HTTP-only auth cookie rides along on the
 * cross-origin stream request (the backend allows credentialed CORS).
 */
export function useTaskStream(onEvent: (event: TaskEvent) => void) {
  // Keep the latest callback without re-opening the connection each render.
  const handler = React.useRef(onEvent);
  React.useEffect(() => {
    handler.current = onEvent;
  });

  React.useEffect(() => {
    const source = new EventSource(TASK_STREAM_URL, { withCredentials: true });

    source.addEventListener("task", (event) => {
      try {
        handler.current(JSON.parse((event as MessageEvent).data) as TaskEvent);
      } catch {
        // Ignore malformed frames.
      }
    });

    return () => source.close();
  }, []);
}
