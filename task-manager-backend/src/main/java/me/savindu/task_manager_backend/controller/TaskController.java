package me.savindu.task_manager_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.SuccessCode;
import me.savindu.task_manager_backend.common.response.ApiResponse;
import me.savindu.task_manager_backend.common.response.PaginatedResponse;
import me.savindu.task_manager_backend.common.response.PaginationRequest;
import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.TaskFilter;
import me.savindu.task_manager_backend.dto.TaskHistoryResponse;
import me.savindu.task_manager_backend.dto.TaskResponse;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.Instant;
import me.savindu.task_manager_backend.messaging.TaskStreamService;
import java.util.List;
import me.savindu.task_manager_backend.security.AppUserDetails;
import me.savindu.task_manager_backend.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Task endpoints for the authenticated user, scoped to the caller's own tasks (owner id from the security principal). */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Manage your own tasks (role USER)")
public class TaskController {

    private final TaskService taskService;
    private final TaskStreamService taskStreamService;

    @Operation(summary = "Subscribe to real-time updates for the current user's tasks (SSE)")
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal AppUserDetails principal) {
        return taskStreamService.subscribeOwner(principal.getId());
    }

    @Operation(summary = "Create a task owned by the current user")
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @AuthenticationPrincipal AppUserDetails principal,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse created = taskService.createForOwner(principal.getId(), request);
        return ResponseEntity.status(SuccessCode.TASK_CREATED.getStatus())
                .body(ApiResponse.success(SuccessCode.TASK_CREATED, created));
    }

    @Operation(summary = "List the current user's tasks (paginated, optional status code filter)")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<TaskResponse>>> list(
            @AuthenticationPrincipal AppUserDetails principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant dueTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo,
            @Valid PaginationRequest pagination) {
        TaskFilter filter = new TaskFilter(null, status, keyword, dueFrom, dueTo, createdFrom, createdTo);
        Page<TaskResponse> page = taskService.getOwnTasks(principal.getId(), filter, pagination.toPageable());
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, PaginatedResponse.from(page)));
    }

    @Operation(summary = "Get one of the current user's tasks")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> get(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable Long id) {
        TaskResponse task = taskService.getOwnTask(principal.getId(), id);
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, task));
    }

    @Operation(summary = "Update one of the current user's tasks")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        TaskResponse updated = taskService.updateOwnTask(principal.getId(), id, request);
        return ResponseEntity.status(SuccessCode.TASK_UPDATED.getStatus())
                .body(ApiResponse.success(SuccessCode.TASK_UPDATED, updated));
    }

    @Operation(summary = "Delete one of the current user's tasks")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable Long id) {
        taskService.deleteOwnTask(principal.getId(), id);
        return ResponseEntity.status(SuccessCode.TASK_DELETED.getStatus())
                .body(ApiResponse.success(SuccessCode.TASK_DELETED));
    }

    @Operation(summary = "Get the change history for one of the current user's tasks")
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<TaskHistoryResponse>>> history(
            @AuthenticationPrincipal AppUserDetails principal,
            @PathVariable Long id) {
        List<TaskHistoryResponse> history = taskService.getOwnTaskHistory(principal.getId(), id);
        return ResponseEntity.status(SuccessCode.DATA_RETRIEVED.getStatus())
                .body(ApiResponse.success(SuccessCode.DATA_RETRIEVED, history));
    }
}
