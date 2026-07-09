package me.savindu.task_manager_backend.service;

import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskFilter;
import me.savindu.task_manager_backend.dto.TaskHistoryResponse;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/** Task use cases + authorization; USER methods scoped to ownerId, ADMIN across all tasks, status filter optional. */
public interface TaskService {

    // ----- USER: own tasks only -----

    TaskResponse createForOwner(Long ownerId, CreateTaskRequest request);

    Page<TaskResponse> getOwnTasks(Long ownerId, TaskFilter filter, Pageable pageable);

    TaskResponse getOwnTask(Long ownerId, Long taskId);

    TaskResponse updateOwnTask(Long ownerId, Long taskId, UpdateTaskRequest request);

    void deleteOwnTask(Long ownerId, Long taskId);

    List<TaskHistoryResponse> getOwnTaskHistory(Long ownerId, Long taskId);

    // ----- ADMIN: all tasks -----

    Page<TaskResponse> getAllTasks(TaskFilter filter, Pageable pageable);

    TaskResponse getAnyTask(Long taskId);

    TaskResponse updateAnyTask(Long taskId, UpdateTaskRequest request);

    void deleteAnyTask(Long taskId);

    List<TaskHistoryResponse> getAnyTaskHistory(Long taskId);
}
