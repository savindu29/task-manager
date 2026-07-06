package me.savindu.task_manager_backend.messaging;

/** Kind of task change broadcast to connected clients. */
public enum TaskEventType {
    CREATED,
    UPDATED,
    DELETED
}
