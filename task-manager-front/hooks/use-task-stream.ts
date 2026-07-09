"use client";

import * as React from "react";

import { getToken } from "@/lib/auth-token";
import { TASK_STREAM_URL, type TaskEvent } from "@/lib/tasks";

/**
 * Subscribe to a server-sent task stream and invoke `onEvent` for every
 * real-time change. Defaults to the current user's own-task stream; pass the
 * admin stream URL to receive changes to all tasks. The connection is opened
 * once (per URL) and closed on unmount; EventSource auto-reconnects.
 *
 * EventSource cannot set request headers, so the JWT is passed as a `token`
 * query parameter (the backend accepts it there for the stream endpoints).
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
