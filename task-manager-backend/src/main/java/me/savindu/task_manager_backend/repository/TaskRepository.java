package me.savindu.task_manager_backend.repository;

import me.savindu.task_manager_backend.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/** Owner-scoped finders enforce data isolation at the query level; @EntityGraph eager-loads owner+status to avoid N+1. */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Paginated listing; every filter is optional (null = ignored). */
    @EntityGraph(attributePaths = {"owner", "status"})
    @Query("""
            select t from Task t
            where (:ownerId is null or t.owner.id = :ownerId)
              and (:statusCode is null or t.status.code = :statusCode)
              and (:keyword is null
                   or lower(t.title) like lower(concat('%', cast(:keyword as string), '%'))
                   or lower(t.description) like lower(concat('%', cast(:keyword as string), '%')))
              and t.dueDate >= coalesce(:dueFrom, t.dueDate)
              and t.dueDate <= coalesce(:dueTo, t.dueDate)
              and t.createdAt >= coalesce(:createdFrom, t.createdAt)
              and t.createdAt <= coalesce(:createdTo, t.createdAt)
            """)
    Page<Task> search(@Param("ownerId") Long ownerId,
                      @Param("statusCode") String statusCode,
                      @Param("keyword") String keyword,
                      @Param("dueFrom") Instant dueFrom,
                      @Param("dueTo") Instant dueTo,
                      @Param("createdFrom") Instant createdFrom,
                      @Param("createdTo") Instant createdTo,
                      Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "status"})
    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);

    @EntityGraph(attributePaths = {"owner", "status"})
    Optional<Task> findWithOwnerById(Long id);
}
