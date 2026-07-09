package me.savindu.task_manager_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Binds the app.cookie.* properties controlling the HTTP-only auth cookie. */
@ConfigurationProperties(prefix = "app.cookie")
public record CookieProperties(
        String name,
        boolean secure,
        boolean httpOnly,
        String sameSite,
        String path,
        long maxAgeSeconds
) {
}
