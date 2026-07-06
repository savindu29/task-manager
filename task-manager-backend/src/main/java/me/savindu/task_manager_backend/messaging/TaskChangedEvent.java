package me.savindu.task_manager_backend.messaging;

/**
 * Internal Spring application event raised by the service layer inside the
 * transaction. A transactional listener forwards it to the SSE streams only
 * after the transaction commits, so clients never see a change that was rolled
 * back.
 *
 * @param ownerId the task owner's user id (routes to their per-user SSE stream)
 * @param event   the payload pushed to clients
 */
public record TaskChangedEvent(Long ownerId, TaskEvent event) {
}
