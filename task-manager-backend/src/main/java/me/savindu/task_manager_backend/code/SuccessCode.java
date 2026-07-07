package me.savindu.task_manager_backend.code;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

/**
 * Canonical success catalogue. Mirrors {@link ErrorCode} for successful outcomes
 * so responses carry a stable code + message + HTTP status.
 */
@Getter
public enum SuccessCode {

    // --- General ---
    DEFAULT_SUCCESS("SUCCESS", "Success", OK),
    DATA_RETRIEVED("DATA_RETRIEVED", "Data retrieved successfully", OK),

    // --- Authentication ---
    USER_REGISTERED("USER_REGISTERED", "User registered successfully", CREATED),
    LOGIN_SUCCESS("LOGIN_SUCCESS", "Login successful", OK),
    LOGOUT_SUCCESS("LOGOUT_SUCCESS", "Logout successful", OK),

    // --- Tasks ---
    TASK_CREATED("TASK_CREATED", "Task created successfully", CREATED),
    TASK_UPDATED("TASK_UPDATED", "Task updated successfully", OK),
    TASK_DELETED("TASK_DELETED", "Task deleted successfully", OK);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;

    SuccessCode(final String code, final String defaultMessage, final HttpStatus status) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }
}
