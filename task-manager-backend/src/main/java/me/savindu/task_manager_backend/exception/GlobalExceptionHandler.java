package me.savindu.task_manager_backend.exception;

import lombok.extern.slf4j.Slf4j;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import me.savindu.task_manager_backend.common.exception.BusinessException;
import me.savindu.task_manager_backend.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Maps exceptions to the standard {@link ApiResponse} error envelope. Failures
 * that occur in the security filter chain (unauthenticated / forbidden) are
 * handled by the security entry point / access-denied handler instead.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        ErrorCode code = ex.getErrorCode();
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.error(code.getCode(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));

        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.getStatus())
                .body(ApiResponse.error(ErrorCode.INVALID_REQUEST, fieldErrors));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(BadCredentialsException ex) {
        return errorOf(ErrorCode.BAD_CREDENTIALS);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Object>> handleDisabled(DisabledException ex) {
        return errorOf(ErrorCode.USER_DISABLED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return errorOf(ErrorCode.AUTHORIZATION_DENIED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return errorOf(ErrorCode.SERVER_ERROR);
    }

    private ResponseEntity<ApiResponse<Object>> errorOf(ErrorCode code) {
        return ResponseEntity.status(code.getStatus()).body(ApiResponse.error(code));
    }
}
