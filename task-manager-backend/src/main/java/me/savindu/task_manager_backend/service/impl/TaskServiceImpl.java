package me.savindu.task_manager_backend.service.impl;

import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import me.savindu.task_manager_backend.common.exception.BusinessException;
import me.savindu.task_manager_backend.constant.TaskStatusCode;
import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import me.savindu.task_manager_backend.mapper.TaskMapper;
import me.savindu.task_manager_backend.model.Task;
import me.savindu.task_manager_backend.model.TaskStatus;
import me.savindu.task_manager_backend.model.User;
import me.savindu.task_manager_backend.repository.TaskRepository;
import me.savindu.task_manager_backend.repository.TaskStatusRepository;
import me.savindu.task_manager_backend.repository.UserRepository;
import me.savindu.task_manager_backend.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskMapper taskMapper;

    // ============================================================
    // USER - own tasks only
    // ============================================================

    @Override
    @Transactional
    public TaskResponse createForOwner(Long ownerId, CreateTaskRequest request) {
        User owner = userRepository.getReferenceById(ownerId);
        TaskStatus status = resolveStatusOrDefault(request.status());

        Task task = taskMapper.toEntity(request, owner, status);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getOwnTasks(Long ownerId, String statusCode, Pageable pageable) {
        Page<Task> tasks = StringUtils.hasText(statusCode)
                ? taskRepository.findByOwnerIdAndStatus_Code(ownerId, statusCode, pageable)
                : taskRepository.findByOwnerId(ownerId, pageable);
        return tasks.map(taskMapper::toResponse);
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
        taskMapper.applyUpdate(task, request, requireStatus(request.status()));
        return taskMapper.toResponse(task);
    }

    @Override
    @Transactional
    public void deleteOwnTask(Long ownerId, Long taskId) {
        taskRepository.delete(requireOwnedTask(taskId, ownerId));
    }

    // ============================================================
    // ADMIN - all tasks
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(String statusCode, Pageable pageable) {
        Page<Task> tasks = StringUtils.hasText(statusCode)
                ? taskRepository.findByStatus_Code(statusCode, pageable)
                : taskRepository.findAll(pageable);
        return tasks.map(taskMapper::toResponse);
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
        taskMapper.applyUpdate(task, request, requireStatus(request.status()));
        return taskMapper.toResponse(task);
    }

    @Override
    @Transactional
    public void deleteAnyTask(Long taskId) {
        taskRepository.delete(requireTask(taskId));
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
}
