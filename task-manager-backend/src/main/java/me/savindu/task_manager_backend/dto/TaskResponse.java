package me.savindu.task_manager_backend.dto;

import java.time.Instant;

/**
 * Public representation of a task. {@code status} is the status code (e.g. TODO).
 * Includes owner id/name so admins can see who a task belongs to. Built via
 * {@code mapper.TaskMapper}.
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        String status,
        Instant dueDate,
        Long ownerId,
        String ownerName,
        Instant createdAt,
        Instant updatedAt
) {
}
