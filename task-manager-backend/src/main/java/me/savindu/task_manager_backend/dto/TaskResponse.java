package me.savindu.task_manager_backend.dto;

import java.time.Instant;

/** Public task view; status is the status code, includes owner id/name. */
public record TaskResponse(
        Long id,
        String title,
        String description,
        String status,
        Instant dueDate,
        Long ownerId,
        String ownerName,
        String ownerEmail,
        Instant createdAt,
        Instant updatedAt
) {
}
