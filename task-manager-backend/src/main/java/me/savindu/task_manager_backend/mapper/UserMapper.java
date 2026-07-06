package me.savindu.task_manager_backend.mapper;

import me.savindu.task_manager_backend.dto.RegisterRequest;
import me.savindu.task_manager_backend.dto.UserResponse;
import me.savindu.task_manager_backend.model.Role;
import me.savindu.task_manager_backend.model.User;
import org.springframework.stereotype.Component;

/**
 * Maps between user requests, the {@link User} entity and {@link UserResponse}.
 * Pure mapping only: no persistence, no password encoding, no role lookups -
 * those cross-cutting concerns stay in the service layer, which supplies the
 * resolved {@link Role} and the already-encoded password hash.
 */
@Component
public class UserMapper {

    /**
     * Builds a new {@link User} from a registration request. The role and the
     * BCrypt-encoded password are resolved by the caller (service layer).
     */
    public User toEntity(RegisterRequest request, Role role, String encodedPassword) {
        return User.builder()
                .name(request.name().trim())
                .email(request.email().toLowerCase().trim())
                .password(encodedPassword)
                .role(role)
                .enabled(true)
                .build();
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getCode(),
                user.getCreatedAt()
        );
    }
}
