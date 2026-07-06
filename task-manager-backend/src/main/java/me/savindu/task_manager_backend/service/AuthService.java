package me.savindu.task_manager_backend.service;

import me.savindu.task_manager_backend.dto.LoginRequest;
import me.savindu.task_manager_backend.dto.RegisterRequest;
import me.savindu.task_manager_backend.dto.UserResponse;

/**
 * Authentication use cases. Implemented by {@code service.impl.AuthServiceImpl}.
 */
public interface AuthService {

    /** Registers a new USER account and issues an access token. */
    AuthResult register(RegisterRequest request);

    /** Authenticates credentials and issues an access token. */
    AuthResult login(LoginRequest request);

    /** Carrier for a freshly issued token + the public user representation. */
    record AuthResult(String token, UserResponse user) {
    }
}
