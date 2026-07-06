package me.savindu.task_manager_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload to create a task. {@code status} is an optional status code (e.g.
 * TODO, IN_PROGRESS, DONE) and defaults to TODO. The owner is never supplied by
 * the client - it is always the authenticated user.
 */
public record CreateTaskRequest(

        @NotBlank
        @Size(max = 150)
        String title,

        @Size(max = 2000)
        String description,

        @Size(max = 50)
        String status
) {
}
