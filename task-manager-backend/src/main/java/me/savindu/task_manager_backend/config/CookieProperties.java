package me.savindu.task_manager_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds the {@code app.cookie.*} properties that control the HTTP-only
 * authentication cookie.
 *
 * @param name          cookie name
 * @param secure        send only over HTTPS (must be true in production)
 * @param httpOnly      inaccessible to JavaScript (mitigates XSS token theft)
 * @param sameSite      Strict | Lax | None (CSRF mitigation)
 * @param path          cookie path scope
 * @param maxAgeSeconds cookie lifetime in seconds
 */
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
