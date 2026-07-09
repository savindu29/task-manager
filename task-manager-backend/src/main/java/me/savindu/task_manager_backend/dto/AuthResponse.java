package me.savindu.task_manager_backend.dto;

/**
 * Login/register response body. Carries the JWT so a cross-origin browser client
 * (e.g. the Vercel frontend) can store it and send it as an
 * {@code Authorization: Bearer} header, instead of relying on a cross-site
 * cookie. The auth cookie is still set as well for same-origin clients.
 */
public record AuthResponse(String token, UserResponse user) {
}
