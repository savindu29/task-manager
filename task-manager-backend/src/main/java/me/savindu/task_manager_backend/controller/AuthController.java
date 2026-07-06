package me.savindu.task_manager_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.SuccessCode;
import me.savindu.task_manager_backend.common.response.ApiResponse;
import me.savindu.task_manager_backend.dto.LoginRequest;
import me.savindu.task_manager_backend.dto.RegisterRequest;
import me.savindu.task_manager_backend.dto.UserResponse;
import me.savindu.task_manager_backend.mapper.UserMapper;
import me.savindu.task_manager_backend.security.AppUserDetails;
import me.savindu.task_manager_backend.security.CookieService;
import me.savindu.task_manager_backend.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Registration, login, logout and current-user endpoints")
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final UserMapper userMapper;

    @Operation(summary = "Register a new user account (role USER)")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthService.AuthResult result = authService.register(request);
        ResponseCookie cookie = cookieService.createAuthCookie(result.token());

        return ResponseEntity.status(SuccessCode.USER_REGISTERED.getStatus())
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(SuccessCode.USER_REGISTERED, result.user()));
    }

    @Operation(summary = "Authenticate and receive the HTTP-only auth cookie")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthService.AuthResult result = authService.login(request);
        ResponseCookie cookie = cookieService.createAuthCookie(result.token());

        return ResponseEntity.status(SuccessCode.LOGIN_SUCCESS.getStatus())
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(SuccessCode.LOGIN_SUCCESS, result.user()));
    }

    @Operation(summary = "Clear the auth cookie")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie cookie = cookieService.clearAuthCookie();

        return ResponseEntity.status(SuccessCode.LOGOUT_SUCCESS.getStatus())
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(SuccessCode.LOGOUT_SUCCESS));
    }

    @Operation(summary = "Get the currently authenticated user")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal AppUserDetails principal) {
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, userMapper.toResponse(principal.getUser())));
    }
}
