package me.savindu.task_manager_backend.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Forwards committed task changes to the SSE streams: to the owner's per-user
 * stream and to the admin stream. Runs after commit so rolled-back changes are
 * never pushed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskEventListener {

    private final TaskStreamService taskStreamService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTaskChanged(TaskChangedEvent changed) {
        TaskEvent event = changed.event();

        if (changed.ownerId() != null) {
            taskStreamService.sendToOwner(changed.ownerId(), event);
        }
        taskStreamService.sendToAdmins(event);

        log.debug("Streamed task event {} for task {}", event.type(), event.taskId());
    }
}
