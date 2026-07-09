package me.savindu.task_manager_backend.dto;

import java.time.Instant;

/** One task-history entry for the client. field/oldValue/newValue are null for CREATED. */
public record TaskHistoryResponse(
        Long id,
        String action,
        String field,
        String oldValue,
        String newValue,
        String changedBy,
        Instant changedAt
) {
}
