package me.savindu.task_manager_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.SuccessCode;
import me.savindu.task_manager_backend.common.response.ApiResponse;
import me.savindu.task_manager_backend.common.response.PaginatedResponse;
import me.savindu.task_manager_backend.common.response.PaginationRequest;
import me.savindu.task_manager_backend.dto.TaskFilter;
import me.savindu.task_manager_backend.dto.TaskHistoryResponse;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import me.savindu.task_manager_backend.messaging.TaskStreamService;
import me.savindu.task_manager_backend.service.TaskService;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Admin task endpoints for all users' tasks; access enforced by the /api/admin/** rule and class-level @PreAuthorize. */
@RestController
@RequestMapping("/api/admin/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Tasks", description = "View and manage all tasks (role ADMIN)")
public class AdminTaskController {

    private final TaskService taskService;
    private final TaskStreamService taskStreamService;

    @Operation(summary = "Subscribe to real-time updates for all tasks (SSE, admin)")
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return taskStreamService.subscribeAdmin();
    }

    @Operation(summary = "List all tasks (paginated, optional status code and owner id filters)")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<TaskResponse>>> listAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dueTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @Valid PaginationRequest pagination) {
        TaskFilter filter = new TaskFilter(ownerId, status, keyword, dueFrom, dueTo, createdFrom, createdTo);
        Page<TaskResponse> page = taskService.getAllTasks(filter, pagination.toPageable());
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

    @Operation(summary = "Get the change history for any task by id")
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<TaskHistoryResponse>>> history(@PathVariable Long id) {
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, taskService.getAnyTaskHistory(id)));
    }
}
