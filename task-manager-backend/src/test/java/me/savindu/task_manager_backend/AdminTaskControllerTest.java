package me.savindu.task_manager_backend;

import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Admin-only access (RBAC) and cross-user task management. */
class AdminTaskControllerTest extends AbstractIntegrationTest {

    private static final Instant DUE = Instant.parse("2026-12-31T00:00:00Z");

    private long createTaskAsUser(String userToken, String title) throws Exception {
        var result = mockMvc.perform(post("/api/tasks").header("Authorization", bearer(userToken))
                        .contentType(JSON)
                        .content(json(new CreateTaskRequest(title, "desc", null, DUE))))
                .andExpect(status().is2xxSuccessful())
                .andReturn();
        return idOf(result);
    }

    @Test
    void regularUser_cannotAccessAdminEndpoints_returnsForbidden() throws Exception {
        String userToken = register("Plain User", uniqueEmail(), "password123");

        mockMvc.perform(get("/api/admin/tasks").header("Authorization", bearer(userToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("AUTHORIZATION_DENIED"));
    }

    @Test
    void unauthenticated_cannotAccessAdminEndpoints_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void admin_canListAllTasks() throws Exception {
        String userToken = register("Owner", uniqueEmail(), "password123");
        createTaskAsUser(userToken, "Visible to admin");

        mockMvc.perform(get("/api/admin/tasks").header("Authorization", bearer(adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.pagination.totalElements").isNumber());
    }

    @Test
    void admin_canUpdateAnyUsersTask() throws Exception {
        String userToken = register("Owner Two", uniqueEmail(), "password123");
        long id = createTaskAsUser(userToken, "User task");

        mockMvc.perform(put("/api/admin/tasks/" + id).header("Authorization", bearer(adminToken()))
                        .contentType(JSON)
                        .content(json(new UpdateTaskRequest("Edited by admin", "desc", "IN_PROGRESS", DUE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Edited by admin"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }
}
