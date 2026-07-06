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
 * Reference table of roles ({@code r_roles}) used for RBAC. {@code code} is the
 * natural key (e.g. USER, ADMIN); Spring Security authorities are derived as
 * "ROLE_" + code.
 */
@Entity
@Table(
        name = "r_roles",
        uniqueConstraints = @UniqueConstraint(name = "uk_r_roles_code", columnNames = "code")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 200)
    private String description;
}
