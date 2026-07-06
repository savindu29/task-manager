package me.savindu.task_manager_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.SuccessCode;
import me.savindu.task_manager_backend.common.response.ApiResponse;
import me.savindu.task_manager_backend.common.response.PaginatedResponse;
import me.savindu.task_manager_backend.common.response.PaginationRequest;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import me.savindu.task_manager_backend.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin task endpoints - view and manage every user's tasks. Access is enforced
 * two ways (defence in depth): the {@code /api/admin/**} URL rule in
 * SecurityConfig and the class-level {@link PreAuthorize} below.
 */
@RestController
@RequestMapping("/api/admin/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Tasks", description = "View and manage all tasks (role ADMIN)")
public class AdminTaskController {

    private final TaskService taskService;

    @Operation(summary = "List all tasks (paginated, optional status code filter)")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<TaskResponse>>> listAll(
            @RequestParam(required = false) String status,
            @Valid PaginationRequest pagination) {
        Page<TaskResponse> page = taskService.getAllTasks(status, pagination.toPageable());
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, PaginatedResponse.from(page)));
    }

    @Operation(summary = "Get any task by id")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> get(@PathVariable Long id) {
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, taskService.getAnyTask(id)));
    }

    @Operation(summary = "Update any task by id")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.status(SuccessCode.TASK_UPDATED.getStatus())
                .body(ApiResponse.success(SuccessCode.TASK_UPDATED, taskService.updateAnyTask(id, request)));
    }

    @Operation(summary = "Delete any task by id")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taskService.deleteAnyTask(id);
        return ResponseEntity.status(SuccessCode.TASK_DELETED.getStatus())
                .body(ApiResponse.success(SuccessCode.TASK_DELETED));
    }
}
