package me.savindu.task_manager_backend.service;

import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.dto.TaskHistoryResponse;
import me.savindu.task_manager_backend.model.TaskHistory;
import me.savindu.task_manager_backend.model.TaskHistoryAction;
import me.savindu.task_manager_backend.repository.TaskHistoryRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Records and reads a task's change history. */
@Service
@RequiredArgsConstructor
public class TaskHistoryService {

    private final TaskHistoryRepository historyRepository;

    /** Immutable view of a task's tracked fields, taken before/after an update. */
    public record TaskSnapshot(String title, String description, String status, Instant dueDate) {
    }

    @Transactional
    public void recordCreated(Long taskId) {
        historyRepository.save(TaskHistory.builder()
                .taskId(taskId)
                .action(TaskHistoryAction.CREATED)
                .changedBy(currentActor())
                .changedAt(Instant.now())
                .build());
    }

    /** Saves one UPDATED row per changed field. */
    @Transactional
    public void recordUpdate(Long taskId, TaskSnapshot before, TaskSnapshot after) {
        String actor = currentActor();
        Instant now = Instant.now();
        List<TaskHistory> entries = new ArrayList<>();

        addIfChanged(entries, taskId, "Title", before.title(), after.title(), actor, now);
        addIfChanged(entries, taskId, "Description", before.description(), after.description(), actor, now);
        addIfChanged(entries, taskId, "Status", before.status(), after.status(), actor, now);
        addIfChanged(entries, taskId, "Due date",
                toText(before.dueDate()), toText(after.dueDate()), actor, now);

        if (!entries.isEmpty()) {
            historyRepository.saveAll(entries);
        }
    }

    @Transactional(readOnly = true)
    public List<TaskHistoryResponse> getHistory(Long taskId) {
        return historyRepository.findByTaskIdOrderByChangedAtDesc(taskId).stream()
                .map(h -> new TaskHistoryResponse(
                        h.getId(),
                        h.getAction().name(),
                        h.getFieldName(),
                        h.getOldValue(),
                        h.getNewValue(),
                        h.getChangedBy(),
                        h.getChangedAt()))
                .toList();
    }

    private void addIfChanged(List<TaskHistory> entries, Long taskId, String field,
                              String oldValue, String newValue, String actor, Instant when) {
        if (!Objects.equals(oldValue, newValue)) {
            entries.add(TaskHistory.builder()
                    .taskId(taskId)
                    .action(TaskHistoryAction.UPDATED)
                    .fieldName(field)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .changedBy(actor)
                    .changedAt(when)
                    .build());
        }
    }

    private String toText(Instant instant) {
        return instant == null ? null : instant.toString();
    }

    private String currentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "system";
    }
}
