package me.savindu.task_manager_backend.constant;

/**
 * Well-known role codes (the natural keys of the {@code r_roles} reference
 * table). Used for seeding and lookups so the code stays type-checked without
 * reintroducing an enum.
 */
public final class RoleCode {

    public static final String USER = "USER";
    public static final String ADMIN = "ADMIN";

    private RoleCode() {
    }
}
