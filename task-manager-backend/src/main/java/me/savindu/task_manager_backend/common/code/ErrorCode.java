package me.savindu.task_manager_backend.common.code;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Canonical error catalogue. Each entry carries a stable machine-readable
 * {@code code}, a human-readable default message (may contain {@code %s}
 * placeholders filled by {@code BusinessException} args), and the HTTP status
 * the global handler responds with.
 */
@Getter
public enum ErrorCode {

    // --- General ---
    SERVER_ERROR("SERVER_ERROR", "An unexpected server error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("BAD_REQUEST", "The request is invalid", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("INVALID_REQUEST", "The request is invalid", HttpStatus.BAD_REQUEST),
    METHOD_NOT_ALLOWED("METHOD_NOT_ALLOWED", "The requested method is not allowed", HttpStatus.METHOD_NOT_ALLOWED),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "The requested resource was not found", HttpStatus.NOT_FOUND),

    // --- Authentication & Authorization ---
    UNAUTHORIZED("UNAUTHORIZED", "Authentication is required to access this resource", HttpStatus.UNAUTHORIZED),
    BAD_CREDENTIALS("BAD_CREDENTIALS", "Invalid email or password", HttpStatus.UNAUTHORIZED),
    AUTHORIZATION_DENIED("AUTHORIZATION_DENIED", "You are not authorized to perform this action", HttpStatus.FORBIDDEN),
    USER_DISABLED("USER_DISABLED", "User account is disabled, please contact the administrator", HttpStatus.UNAUTHORIZED),

    // --- User ---
    USER_NOT_FOUND("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "An account with email '%s' already exists", HttpStatus.CONFLICT),
    USER_ROLE_NOT_FOUND("USER_ROLE_NOT_FOUND", "User role '%s' not found", HttpStatus.NOT_FOUND),

    // --- Task ---
    TASK_NOT_FOUND("TASK_NOT_FOUND", "Task not found: %s", HttpStatus.NOT_FOUND),
    INVALID_TASK_STATUS("INVALID_TASK_STATUS", "Invalid task status code: %s", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;

    ErrorCode(final String code, final String defaultMessage, final HttpStatus status) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }
}
