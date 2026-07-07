package me.savindu.task_manager_backend.exception;

import lombok.Getter;
import me.savindu.task_manager_backend.code.ErrorCode;

/**
 * Application-level exception carrying an {@link ErrorCode}. The global handler
 * maps the code to an HTTP status and an {@code ApiResponse.error(...)} body.
 * Optional {@code args} fill {@code %s} placeholders in the code's default message.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final transient Object[] args;

    public BusinessException(ErrorCode errorCode, Object... args) {
        super(formatMessage(errorCode, args));
        this.errorCode = errorCode;
        this.args = args;
    }

    public BusinessException(ErrorCode errorCode, String customMessage, Object... args) {
        super(customMessage != null ? customMessage : formatMessage(errorCode, args));
        this.errorCode = errorCode;
        this.args = args;
    }

    private static String formatMessage(ErrorCode errorCode, Object... args) {
        if (args != null && args.length > 0) {
            return String.format(errorCode.getDefaultMessage(), args);
        }
        return errorCode.getDefaultMessage();
    }
}
