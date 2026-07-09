package me.savindu.task_manager_backend.dto;

import java.time.Instant;

/** Public user view (no password hash); role is the role code. */
public record UserResponse(
        Long id,
        String name,
        String email,
        String role,
        Instant createdAt
) {
}
