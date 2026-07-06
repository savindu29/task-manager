package me.savindu.task_manager_backend.constant;

/**
 * Well-known task-status codes (the natural keys of the {@code r_task_statuses}
 * reference table).
 */
public final class TaskStatusCode {

    public static final String TODO = "TODO";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String DONE = "DONE";

    private TaskStatusCode() {
    }
}
