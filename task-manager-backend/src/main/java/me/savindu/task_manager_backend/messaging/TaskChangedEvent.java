package me.savindu.task_manager_backend.messaging;

/** Internal event raised in-transaction; forwarded to SSE streams only after commit. */
public record TaskChangedEvent(Long ownerId, TaskEvent event) {
}
