package me.savindu.task_manager_backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Returns a 403 ApiResponse body when an authenticated user lacks the required role. */
@Slf4j
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        log.warn("Access denied (403): {} {}", request.getMethod(), request.getRequestURI());
        ErrorResponseWriter.write(response, ErrorCode.AUTHORIZATION_DENIED);
    }
}
