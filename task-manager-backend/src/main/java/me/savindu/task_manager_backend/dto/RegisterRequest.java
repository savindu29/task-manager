package me.savindu.task_manager_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload for self-service user registration. New accounts are always created
 * with the USER role - the ADMIN role is never assignable through this endpoint.
 */
public record RegisterRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @NotBlank
        @Email
        @Size(max = 255)
        String email,

        @NotBlank
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        String password
) {
}
