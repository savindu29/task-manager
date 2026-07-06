package me.savindu.task_manager_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds {@code app.admin.*} - credentials for the bootstrap admin account that
 * is seeded on startup when it does not yet exist.
 */
@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(
        String email,
        String password,
        String name
) {
}
