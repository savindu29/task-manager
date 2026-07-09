package me.savindu.task_manager_backend.exception;

import lombok.Getter;
import me.savindu.task_manager_backend.code.ErrorCode;

/** App exception carrying an ErrorCode; global handler maps it to HTTP status + body, args fill %s placeholders. */
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
