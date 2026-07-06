package me.savindu.task_manager_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Turns on Spring Data JPA auditing and wires the auditor provider that resolves
 * the current user id (see {@link ApplicationAuditorAware}).
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "applicationAuditorAware")
public class JpaAuditingConfig {
}
