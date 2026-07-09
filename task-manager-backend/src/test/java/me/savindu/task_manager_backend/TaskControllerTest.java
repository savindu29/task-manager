package me.savindu.task_manager_backend;

import me.savindu.task_manager_backend.dto.CreateTaskRequest;
import me.savindu.task_manager_backend.dto.UpdateTaskRequest;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Task CRUD, validation and per-user ownership isolation. */
class TaskControllerTest extends AbstractIntegrationTest {

    private static final Instant DUE = Instant.parse("2026-12-31T00:00:00Z");

    private String newUser() throws Exception {
        return register("Task User", uniqueEmail(), "password123");
    }

    private long createTask(String token, String title) throws Exception {
        var result = mockMvc.perform(post("/api/tasks").header("Authorization", bearer(token))
                        .contentType(JSON)
                        .content(json(new CreateTaskRequest(title, "some description", null, DUE))))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.data.id").isNumber())
                .andReturn();
        return idOf(result);
    }

    @Test
    void createTask_thenFetchById() throws Exception {
        String token = newUser();
        long id = createTask(token, "Write tests");

        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Write tests"))
                .andExpect(jsonPath("$.data.status").value("TODO"));
    }

    @Test
    void listTasks_returnsOnlyOwnTasksPaginated() throws Exception {
        String token = newUser();
        createTask(token, "Task A");
        createTask(token, "Task B");

        mockMvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.pagination.totalElements").value(2));
    }

    @Test
    void updateOwnTask() throws Exception {
        String token = newUser();
        long id = createTask(token, "Old title");

        mockMvc.perform(put("/api/tasks/" + id).header("Authorization", bearer(token))
                        .contentType(JSON)
                        .content(json(new UpdateTaskRequest("New title", "updated", "DONE", DUE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("New title"))
                .andExpect(jsonPath("$.data.status").value("DONE"));
    }

    @Test
    void deleteOwnTask_thenNotFound() throws Exception {
        String token = newUser();
        long id = createTask(token, "To delete");

        mockMvc.perform(delete("/api/tasks/" + id).header("Authorization", bearer(token)))
                .andExpect(status().is2xxSuccessful());

        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"));
    }

    @Test
    void cannotAccessAnotherUsersTask() throws Exception {
        String owner = newUser();
        long id = createTask(owner, "Private task");

        String other = newUser();
        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer(other)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TASK_NOT_FOUND"));
    }

    @Test
    void createTask_invalidInput_returnsValidationError() throws Exception {
        String token = newUser();
        mockMvc.perform(post("/api/tasks").header("Authorization", bearer(token))
                        .contentType(JSON)
                        .content(json(new CreateTaskRequest("", "desc", null, DUE))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void createTask_withoutAuth_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/tasks").contentType(JSON)
                        .content(json(new CreateTaskRequest("Nope", "desc", null, DUE))))
                .andExpect(status().isUnauthorized());
    }
}
