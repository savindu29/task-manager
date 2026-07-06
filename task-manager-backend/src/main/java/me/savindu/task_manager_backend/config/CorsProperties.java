package me.savindu.task_manager_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Binds {@code app.cors.allowed-origins} (comma-separated list of frontend origins).
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {
}
