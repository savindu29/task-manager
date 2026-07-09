package me.savindu.task_manager_backend.mapper;

import me.savindu.task_manager_backend.dto.RegisterRequest;
import me.savindu.task_manager_backend.dto.UserResponse;
import me.savindu.task_manager_backend.model.Role;
import me.savindu.task_manager_backend.model.User;
import org.springframework.stereotype.Component;

/** Maps user requests to/from the User entity; role and encoded password supplied by the service. */
@Component
public class UserMapper {

    /** Builds a new User from a registration request; role and BCrypt password resolved by the caller. */
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
