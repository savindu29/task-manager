package me.savindu.task_manager_backend.repository;

import me.savindu.task_manager_backend.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Integer> {

    Optional<TaskStatus> findByCode(String code);

    boolean existsByCode(String code);
}
