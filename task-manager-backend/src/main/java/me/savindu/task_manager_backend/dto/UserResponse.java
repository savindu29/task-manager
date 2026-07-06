package me.savindu.task_manager_backend.dto;

import java.time.Instant;

/**
 * Public representation of a user. Never exposes the password hash.
 * {@code role} is the role code (e.g. USER, ADMIN). Built via
 * {@code mapper.UserMapper}.
 */
public record UserResponse(
        Long id,
        String name,
        String email,
        String role,
        Instant createdAt
) {
}
