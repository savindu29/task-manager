package me.savindu.task_manager_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds the {@code app.jwt.*} properties.
 *
 * @param secret                  Base64-encoded signing key (>= 256 bits for HS256)
 * @param issuer                  value placed in the token's {@code iss} claim
 * @param accessTokenExpirationMs access-token lifetime in milliseconds
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        String issuer,
        long accessTokenExpirationMs
) {
}
