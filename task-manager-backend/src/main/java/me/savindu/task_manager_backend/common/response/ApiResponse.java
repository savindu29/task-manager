package me.savindu.task_manager_backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import me.savindu.task_manager_backend.common.code.SuccessCode;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard response envelope for every endpoint. {@code success} distinguishes
 * outcomes; {@code code}/{@code message} come from {@link SuccessCode} or
 * {@link ErrorCode}; {@code data} is the payload (null for errors / no-content).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String code;
    private String message;
    private LocalDateTime timestamp;
    private T data;

    public static <T> ApiResponse<T> success(SuccessCode successCode, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(successCode.getCode())
                .message(successCode.getDefaultMessage())
                .timestamp(LocalDateTime.now())
                .data(data)
                .build();
    }

    public static ApiResponse<Void> success(SuccessCode successCode) {
        return ApiResponse.<Void>builder()
                .success(true)
                .code(successCode.getCode())
                .message(successCode.getDefaultMessage())
                .timestamp(LocalDateTime.now())
                .data(null)
                .build();
    }

    public static <T> ApiResponse<T> success(SuccessCode successCode, String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(successCode.getCode())
                .message(message)
                .timestamp(LocalDateTime.now())
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getDefaultMessage())
                .timestamp(LocalDateTime.now())
                .data(null)
                .build();
    }

    @SuppressWarnings("unchecked")
    public static <T> ApiResponse<T> error(ErrorCode errorCode, Map<String, Object> details) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getDefaultMessage())
                .timestamp(LocalDateTime.now())
                .data((T) details)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                .data(null)
                .build();
    }

    @SuppressWarnings("unchecked")
    public static <T> ApiResponse<T> error(String code, String message, Map<String, Object> details) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                .data((T) details)
                .build();
    }
}
