package me.savindu.task_manager_backend.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.config.CookieProperties;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;

/** Builds the HTTP-only auth cookie and extracts the token from requests, centralising cookie flags. */
@Service
@RequiredArgsConstructor
public class CookieService {

    private final CookieProperties properties;

    /** Cookie carrying the JWT, set on successful register/login. */
    public ResponseCookie createAuthCookie(String token) {
        return baseCookie(token)
                .maxAge(Duration.ofSeconds(properties.maxAgeSeconds()))
                .build();
    }

    /** Expired, empty cookie used to clear the session on logout. */
    public ResponseCookie clearAuthCookie() {
        return baseCookie("")
                .maxAge(0)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(properties.name(), value)
                .httpOnly(properties.httpOnly())
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path(properties.path());
    }

    /** Reads the JWT from the auth cookie, or null if not present. */
    public String extractToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> properties.name().equals(cookie.getName()))
                .map(jakarta.servlet.http.Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }
}
