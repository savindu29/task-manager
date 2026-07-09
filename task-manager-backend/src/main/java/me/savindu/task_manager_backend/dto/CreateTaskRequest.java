package me.savindu.task_manager_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/** Create-task payload; status optional (defaults TODO), owner is always the authenticated user. */
public record CreateTaskRequest(

        @NotBlank
        @Size(max = 150)
        String title,

        @Size(max = 2000)
        String description,

        @Size(max = 50)
        String status,

        @NotNull
        Instant dueDate
) {
}
