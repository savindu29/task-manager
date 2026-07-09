package me.savindu.task_manager_backend.repository;

import me.savindu.task_manager_backend.model.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** History rows for a task, newest first. */
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {

    List<TaskHistory> findByTaskIdOrderByChangedAtDesc(Long taskId);
}
