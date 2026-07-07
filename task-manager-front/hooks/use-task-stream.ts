"use client";

import * as React from "react";

import { TASK_STREAM_URL, type TaskEvent } from "@/lib/tasks";

/**
 * Subscribe to a server-sent task stream and invoke `onEvent` for every
 * real-time change. Defaults to the current user's own-task stream; pass the
 * admin stream URL to receive changes to all tasks. The connection is opened
 * once (per URL) and closed on unmount; EventSource auto-reconnects.
 *
 * `withCredentials` is required so the HTTP-only auth cookie rides along on the
 * cross-origin stream request (the backend allows credentialed CORS).
 */
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
    const source = new EventSource(url, { withCredentials: true });

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
