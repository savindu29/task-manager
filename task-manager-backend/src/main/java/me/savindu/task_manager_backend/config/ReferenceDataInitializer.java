package me.savindu.task_manager_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.savindu.task_manager_backend.constant.RoleCode;
import me.savindu.task_manager_backend.constant.TaskStatusCode;
import me.savindu.task_manager_backend.model.Role;
import me.savindu.task_manager_backend.model.TaskStatus;
import me.savindu.task_manager_backend.repository.RoleRepository;
import me.savindu.task_manager_backend.repository.TaskStatusRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Idempotently seeds the role and task-status reference tables on startup, before DataInitializer. */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class ReferenceDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final TaskStatusRepository taskStatusRepository;

    @Override
    public void run(String... args) {
        seedRole(RoleCode.USER, "Standard user - manages their own tasks");
        seedRole(RoleCode.ADMIN, "Administrator - manages all tasks");

        seedStatus(TaskStatusCode.TODO, "Not started", 1);
        seedStatus(TaskStatusCode.IN_PROGRESS, "Work in progress", 2);
        seedStatus(TaskStatusCode.DONE, "Completed", 3);
    }

    private void seedRole(String code, String description) {
        if (roleRepository.existsByCode(code)) {
            return;
        }
        roleRepository.save(Role.builder()
                .code(code)
                .description(description)
                .build());
        log.info("Seeded role: {}", code);
    }

    private void seedStatus(String code, String description, int sortOrder) {
        if (taskStatusRepository.existsByCode(code)) {
            return;
        }
        taskStatusRepository.save(TaskStatus.builder()
                .code(code)
                .description(description)
                .sortOrder(sortOrder)
                .build());
        log.info("Seeded task status: {}", code);
    }
}
