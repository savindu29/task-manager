package me.savindu.task_manager_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.savindu.task_manager_backend.constant.RoleCode;
import me.savindu.task_manager_backend.model.Role;
import me.savindu.task_manager_backend.model.User;
import me.savindu.task_manager_backend.repository.RoleRepository;
import me.savindu.task_manager_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds the bootstrap ADMIN account (from app.admin.*) on startup if absent, after ReferenceDataInitializer. */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    @Override
    public void run(String... args) {
        String email = adminProperties.email().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            log.debug("Admin account already present, skipping seed");
            return;
        }

        Role adminRole = roleRepository.findByCode(RoleCode.ADMIN)
                .orElseThrow(() -> new IllegalStateException(
                        "Role '" + RoleCode.ADMIN + "' is not seeded"));

        User admin = User.builder()
                .name(adminProperties.name())
                .email(email)
                .password(passwordEncoder.encode(adminProperties.password()))
                .role(adminRole)
                .enabled(true)
                .build();

        userRepository.save(admin);
        log.info("Seeded bootstrap ADMIN account: {}", email);
    }
}
