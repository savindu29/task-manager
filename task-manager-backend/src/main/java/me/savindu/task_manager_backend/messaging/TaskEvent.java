package me.savindu.task_manager_backend.messaging;

import me.savindu.task_manager_backend.dto.TaskResponse;

import java.time.Instant;

/**
 * Real-time payload delivered to subscribed clients. {@code task} is the current
 * state for CREATED/UPDATED and null for DELETED (only {@code taskId} is set).
 */
public record TaskEvent(
        TaskEventType type,
        Long taskId,
        TaskResponse task,
        Instant timestamp
) {
    public static TaskEvent created(TaskResponse task) {
        return new TaskEvent(TaskEventType.CREATED, task.id(), task, Instant.now());
    }

    public static TaskEvent updated(TaskResponse task) {
        return new TaskEvent(TaskEventType.UPDATED, task.id(), task, Instant.now());
    }

    public static TaskEvent deleted(Long taskId) {
        return new TaskEvent(TaskEventType.DELETED, taskId, null, Instant.now());
    }
}
