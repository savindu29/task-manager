package me.savindu.task_manager_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/** Full-replace update payload (PUT); status required, ownership not changeable. */
public record UpdateTaskRequest(

        @NotBlank
        @Size(max = 150)
        String title,

        @Size(max = 2000)
        String description,

        @NotBlank
        @Size(max = 50)
        String status,

        @NotNull
        Instant dueDate
) {
}
