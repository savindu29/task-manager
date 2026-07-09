package me.savindu.task_manager_backend.mapper;

import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import me.savindu.task_manager_backend.model.Task;
import me.savindu.task_manager_backend.model.TaskStatus;
import me.savindu.task_manager_backend.model.User;
import org.springframework.stereotype.Component;

/** Maps task requests to/from the Task entity; owner and resolved status supplied by the service. */
@Component
public class TaskMapper {

    public Task toEntity(CreateTaskRequest request, User owner, TaskStatus status) {
        return Task.builder()
                .title(request.title().trim())
                .description(request.description())
                .status(status)
                .dueDate(request.dueDate())
                .owner(owner)
                .build();
    }

    /** Full-replace update onto a managed Task; ownership never changes. */
    public void applyUpdate(Task task, UpdateTaskRequest request, TaskStatus status) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(status);
        task.setDueDate(request.dueDate());
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().getCode(),
                task.getDueDate(),
                task.getOwner().getId(),
                task.getOwner().getName(),
                task.getOwner().getEmail(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
