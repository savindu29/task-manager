package me.savindu.task_manager_backend.config;

import me.savindu.task_manager_backend.security.AppUserDetails;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Supplies the current auditor (the acting user's id) for Spring Data auditing's
 * {@code @CreatedBy} / {@code @LastModifiedBy} fields. Returns empty for
 * unauthenticated/anonymous requests so those columns stay null (e.g. the very
 * first registration or the bootstrap admin seed).
 */
@Component
public class ApplicationAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof AppUserDetails userDetails) {
            return Optional.of(String.valueOf(userDetails.getId()));
        }

        return Optional.empty();
    }
}
