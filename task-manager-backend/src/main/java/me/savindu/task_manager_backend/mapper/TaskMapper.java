package me.savindu.task_manager_backend.mapper;

import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import me.savindu.task_manager_backend.model.Task;
import me.savindu.task_manager_backend.model.TaskStatus;
import me.savindu.task_manager_backend.model.User;
import org.springframework.stereotype.Component;

/**
 * Maps between task requests, the {@link Task} entity and {@link TaskResponse}.
 * Pure mapping only: the owner and the resolved {@link TaskStatus} reference are
 * supplied by the service layer.
 */
@Component
public class TaskMapper {

    public Task toEntity(CreateTaskRequest request, User owner, TaskStatus status) {
        return Task.builder()
                .title(request.title().trim())
                .description(request.description())
                .status(status)
                .owner(owner)
                .build();
    }

    /**
     * Applies a full-replace update onto a managed {@link Task}. The resolved
     * status reference is supplied by the caller. Ownership is never changed.
     */
    public void applyUpdate(Task task, UpdateTaskRequest request, TaskStatus status) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(status);
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().getCode(),
                task.getOwner().getId(),
                task.getOwner().getName(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
