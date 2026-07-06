package me.savindu.task_manager_backend.service;

import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Task use cases + authorization. Implemented by
 * {@code service.impl.TaskServiceImpl}.
 *
 * <p>USER methods are scoped to {@code ownerId} (own tasks only); ADMIN methods
 * operate across all tasks. {@code statusCode} filters are optional (null/blank
 * = no filter).
 */
public interface TaskService {

    // ----- USER: own tasks only -----

    TaskResponse createForOwner(Long ownerId, CreateTaskRequest request);

    Page<TaskResponse> getOwnTasks(Long ownerId, String statusCode, Pageable pageable);

    TaskResponse getOwnTask(Long ownerId, Long taskId);

    TaskResponse updateOwnTask(Long ownerId, Long taskId, UpdateTaskRequest request);

    void deleteOwnTask(Long ownerId, Long taskId);

    // ----- ADMIN: all tasks -----

    Page<TaskResponse> getAllTasks(String statusCode, Pageable pageable);

    TaskResponse getAnyTask(Long taskId);

    TaskResponse updateAnyTask(Long taskId, UpdateTaskRequest request);

    void deleteAnyTask(Long taskId);
}
