package me.savindu.task_manager_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** Enables Spring Data JPA auditing, wired to ApplicationAuditorAware. */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "applicationAuditorAware")
public class JpaAuditingConfig {
}
