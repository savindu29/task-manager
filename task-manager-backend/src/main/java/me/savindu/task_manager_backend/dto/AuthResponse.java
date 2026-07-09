package me.savindu.task_manager_backend.dto;

/** Login/register response carrying the JWT (Bearer header) plus an auth cookie. */
public record AuthResponse(String token, UserResponse user) {
}
