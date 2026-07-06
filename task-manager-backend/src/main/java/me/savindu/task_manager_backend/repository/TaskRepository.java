package me.savindu.task_manager_backend.repository;

import me.savindu.task_manager_backend.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Owner-scoped finders enforce data isolation at the query level: a user's
 * endpoints only ever call {@code findByIdAndOwnerId} or pass their own id to
 * {@link #search}, so one user can never read or mutate another user's task even
 * by guessing an id. {@code @EntityGraph} eagerly loads the owner and status to
 * avoid N+1 selects when mapping to responses.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Flexible, paginated listing with optional filters. A null {@code ownerId}
     * means "all owners" (admin); a null {@code statusCode} means "any status".
     * User endpoints always pass their own id, so the same query safely serves
     * both roles.
     */
    @EntityGraph(attributePaths = {"owner", "status"})
    @Query("""
            select t from Task t
            where (:ownerId is null or t.owner.id = :ownerId)
              and (:statusCode is null or t.status.code = :statusCode)
            """)
    Page<Task> search(@Param("ownerId") Long ownerId,
                      @Param("statusCode") String statusCode,
                      Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "status"})
    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);

    @EntityGraph(attributePaths = {"owner", "status"})
    Optional<Task> findWithOwnerById(Long id);
}
