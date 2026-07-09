package me.savindu.task_manager_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Binds app.admin.* credentials for the bootstrap admin account seeded on startup. */
@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(
        String email,
        String password,
        String name
) {
}
