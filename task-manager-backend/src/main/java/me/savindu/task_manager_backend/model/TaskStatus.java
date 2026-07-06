package me.savindu.task_manager_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Reference table of task lifecycle states ({@code r_task_statuses}).
 * {@code code} is the natural key (e.g. TODO, IN_PROGRESS, DONE).
 */
@Entity
@Table(
        name = "r_task_statuses",
        uniqueConstraints = @UniqueConstraint(name = "uk_r_task_statuses_code", columnNames = "code")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 200)
    private String description;

    /** Optional ordering hint for presenting statuses in a stable sequence. */
    @Column(name = "sort_order")
    private Integer sortOrder;
}
