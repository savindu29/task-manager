package me.savindu.task_manager_backend.security;

import jakarta.servlet.http.HttpServletResponse;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.LocalDateTime;

/** Writes the standard ApiResponse error envelope directly to the servlet response for the security handlers (no JSON library). */
final class ErrorResponseWriter {

    private ErrorResponseWriter() {
    }

    static void write(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        response.setStatus(errorCode.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String body = "{"
                + "\"success\":false,"
                + "\"code\":\"" + escape(errorCode.getCode()) + "\","
                + "\"message\":\"" + escape(errorCode.getDefaultMessage()) + "\","
                + "\"timestamp\":\"" + LocalDateTime.now() + "\","
                + "\"data\":null"
                + "}";

        response.getWriter().write(body);
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
