package me.savindu.task_manager_backend.dto;

import java.time.Instant;

/** Optional task-list filters; any null field is ignored by the query. */
public record TaskFilter(
        Long ownerId,
        String status,
        String keyword,
        Instant dueFrom,
        Instant dueTo,
        Instant createdFrom,
        Instant createdTo
) {
}
