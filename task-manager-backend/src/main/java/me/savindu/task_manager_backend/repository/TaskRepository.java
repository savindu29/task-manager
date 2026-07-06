package me.savindu.task_manager_backend.repository;

import me.savindu.task_manager_backend.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Owner-scoped finders enforce data isolation at the query level: a user's
 * endpoints only ever call the {@code ...OwnerId} variants, so one user can
 * never read or mutate another user's task even by guessing an id. Admin
 * endpoints use the unscoped finders. {@code @EntityGraph} eagerly loads the
 * owner and status to avoid N+1 selects when mapping to responses. Status
 * filtering traverses the reference table via the {@code status.code} path.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // ----- User-scoped (own tasks only) -----

    @EntityGraph(attributePaths = {"owner", "status"})
    Page<Task> findByOwnerId(Long ownerId, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "status"})
    Page<Task> findByOwnerIdAndStatus_Code(Long ownerId, String statusCode, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "status"})
    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);

    // ----- Admin (all tasks) -----

    @Override
    @EntityGraph(attributePaths = {"owner", "status"})
    Page<Task> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "status"})
    Page<Task> findByStatus_Code(String statusCode, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "status"})
    Optional<Task> findWithOwnerById(Long id);
}
