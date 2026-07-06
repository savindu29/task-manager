package me.savindu.task_manager_backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Returns a 401 {@code ApiResponse} error body when an unauthenticated request
 * hits a protected endpoint, instead of the default redirect to a login page.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ErrorResponseWriter.write(response, ErrorCode.UNAUTHORIZED);
    }
}
