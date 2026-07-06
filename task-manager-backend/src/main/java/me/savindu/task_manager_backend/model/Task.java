package me.savindu.task_manager_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A task owned by exactly one {@link User}. Ownership drives authorization:
 * regular users may only touch tasks whose {@code owner} is themselves, while
 * admins may access every task. {@code status} is a FK to the
 * {@code r_task_statuses} reference table. Timestamps and auditor columns are
 * populated by {@link BaseAuditEntity}.
 */
@Entity
@Table(
        name = "m_tasks",
        indexes = {
                @Index(name = "idx_m_tasks_owner_id", columnList = "owner_id"),
                @Index(name = "idx_m_tasks_status_id", columnList = "status_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Task extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "status_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_m_tasks_status")
    )
    private TaskStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "owner_id",
            nullable = false,
            updatable = false,
            foreignKey = @ForeignKey(name = "fk_m_tasks_owner")
    )
    private User owner;
}
