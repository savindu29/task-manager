package me.savindu.task_manager_backend.service.impl;

import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import me.savindu.task_manager_backend.common.exception.BusinessException;
import me.savindu.task_manager_backend.constant.TaskStatusCode;
import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskFilter;
import me.savindu.task_manager_backend.dto.TaskHistoryResponse;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import me.savindu.task_manager_backend.mapper.TaskMapper;
import me.savindu.task_manager_backend.messaging.TaskChangedEvent;
import me.savindu.task_manager_backend.messaging.TaskEvent;
import me.savindu.task_manager_backend.model.Task;
import me.savindu.task_manager_backend.model.TaskStatus;
import me.savindu.task_manager_backend.model.User;
import me.savindu.task_manager_backend.repository.TaskRepository;
import me.savindu.task_manager_backend.repository.TaskStatusRepository;
import me.savindu.task_manager_backend.repository.UserRepository;
import me.savindu.task_manager_backend.service.TaskHistoryService;
import me.savindu.task_manager_backend.service.TaskService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskMapper taskMapper;
    private final TaskHistoryService taskHistoryService;
    private final ApplicationEventPublisher eventPublisher;

    // ============================================================
    // USER - own tasks only
    // ============================================================

    @Override
    @Transactional
    public TaskResponse createForOwner(Long ownerId, CreateTaskRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        TaskStatus status = resolveStatusOrDefault(request.status());

        Task saved = taskRepository.save(taskMapper.toEntity(request, owner, status));
        taskHistoryService.recordCreated(saved.getId());
        TaskResponse response = taskMapper.toResponse(saved);

        publish(saved.getOwner().getId(), TaskEvent.created(response));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getOwnTasks(Long ownerId, TaskFilter filter, Pageable pageable) {
        return taskRepository.search(
                ownerId,
                normalize(filter.status()),
                normalize(filter.keyword()),
                filter.dueFrom(), filter.dueTo(),
                filter.createdFrom(), filter.createdTo(),
                pageable).map(taskMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getOwnTask(Long ownerId, Long taskId) {
        return taskMapper.toResponse(requireOwnedTask(taskId, ownerId));
    }

    @Override
    @Transactional
    public TaskResponse updateOwnTask(Long ownerId, Long taskId, UpdateTaskRequest request) {
        Task task = requireOwnedTask(taskId, ownerId);
        TaskHistoryService.TaskSnapshot before = snapshot(task);
        taskMapper.applyUpdate(task, request, requireStatus(request.status()));
        taskHistoryService.recordUpdate(taskId, before, snapshot(task));
        TaskResponse response = taskMapper.toResponse(task);

        publish(task.getOwner().getId(), TaskEvent.updated(response));
        return response;
    }

    @Override
    @Transactional
    public void deleteOwnTask(Long ownerId, Long taskId) {
        Task task = requireOwnedTask(taskId, ownerId);
        Long taskOwnerId = task.getOwner().getId();
        taskRepository.delete(task);

        publish(taskOwnerId, TaskEvent.deleted(taskId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskHistoryResponse> getOwnTaskHistory(Long ownerId, Long taskId) {
        requireOwnedTask(taskId, ownerId); // authorization
        return taskHistoryService.getHistory(taskId);
    }

    // ============================================================
    // ADMIN - all tasks
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(TaskFilter filter, Pageable pageable) {
        return taskRepository.search(
                filter.ownerId(),
                normalize(filter.status()),
                normalize(filter.keyword()),
                filter.dueFrom(), filter.dueTo(),
                filter.createdFrom(), filter.createdTo(),
                pageable).map(taskMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getAnyTask(Long taskId) {
        return taskMapper.toResponse(requireTask(taskId));
    }

    @Override
    @Transactional
    public TaskResponse updateAnyTask(Long taskId, UpdateTaskRequest request) {
        Task task = requireTask(taskId);
        TaskHistoryService.TaskSnapshot before = snapshot(task);
        taskMapper.applyUpdate(task, request, requireStatus(request.status()));
        taskHistoryService.recordUpdate(taskId, before, snapshot(task));
        TaskResponse response = taskMapper.toResponse(task);

        publish(task.getOwner().getId(), TaskEvent.updated(response));
        return response;
    }

    @Override
    @Transactional
    public void deleteAnyTask(Long taskId) {
        Task task = requireTask(taskId);
        Long taskOwnerId = task.getOwner().getId();
        taskRepository.delete(task);

        publish(taskOwnerId, TaskEvent.deleted(taskId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskHistoryResponse> getAnyTaskHistory(Long taskId) {
        requireTask(taskId); // 404 if it doesn't exist
        return taskHistoryService.getHistory(taskId);
    }

    // ============================================================
    // Helpers
    // ============================================================

    private Task requireOwnedTask(Long taskId, Long ownerId) {
        return taskRepository.findByIdAndOwnerId(taskId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND, taskId));
    }

    private Task requireTask(Long taskId) {
        return taskRepository.findWithOwnerById(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND, taskId));
    }

    private TaskStatus resolveStatusOrDefault(String code) {
        return StringUtils.hasText(code) ? requireStatus(code) : requireStatus(TaskStatusCode.TODO);
    }

    private TaskStatus requireStatus(String code) {
        return taskStatusRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TASK_STATUS, code));
    }

    /** Blank filter -> null so the search query treats it as "no filter". */
    private String normalize(String statusCode) {
        return StringUtils.hasText(statusCode) ? statusCode : null;
    }

    /** Raises an after-commit event so clients are notified only on success. */
    private void publish(Long ownerId, TaskEvent event) {
        eventPublisher.publishEvent(new TaskChangedEvent(ownerId, event));
    }

    /** Snapshot of the tracked fields, for diffing in the history. */
    private TaskHistoryService.TaskSnapshot snapshot(Task task) {
        return new TaskHistoryService.TaskSnapshot(
                task.getTitle(),
                task.getDescription(),
                task.getStatus().getCode(),
                task.getDueDate());
    }
}
