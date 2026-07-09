package me.savindu.task_manager_backend;

import me.savindu.task_manager_backend.dto.LoginRequest;
import me.savindu.task_manager_backend.dto.RegisterRequest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Registration, login and current-user behaviour. */
class AuthControllerTest extends AbstractIntegrationTest {

    @Test
    void register_returnsTokenAndUser() throws Exception {
        String email = uniqueEmail();
        mockMvc.perform(post("/api/auth/register").contentType(JSON)
                        .content(json(new RegisterRequest("Alice", email, "password123"))))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(email))
                .andExpect(jsonPath("$.data.user.role").value("USER"));
    }

    @Test
    void register_duplicateEmail_returnsConflict() throws Exception {
        String email = uniqueEmail();
        register("Bob", email, "password123");

        mockMvc.perform(post("/api/auth/register").contentType(JSON)
                        .content(json(new RegisterRequest("Bob Two", email, "password123"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"))
                .andExpect(jsonPath("$.message").value(containsString(email)));
    }

    @Test
    void register_invalidInput_returnsValidationErrors() throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(JSON)
                        .content(json(new RegisterRequest("", "not-an-email", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void login_validCredentials_returnsToken() throws Exception {
        String email = uniqueEmail();
        register("Carol", email, "password123");

        mockMvc.perform(post("/api/auth/login").contentType(JSON)
                        .content(json(new LoginRequest(email, "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty());
    }

    @Test
    void login_wrongPassword_returnsUnauthorized() throws Exception {
        String email = uniqueEmail();
        register("Dave", email, "password123");

        mockMvc.perform(post("/api/auth/login").contentType(JSON)
                        .content(json(new LoginRequest(email, "wrong-password"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("BAD_CREDENTIALS"));
    }

    @Test
    void me_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withToken_returnsCurrentUser() throws Exception {
        String email = uniqueEmail();
        String token = register("Eve", email, "password123");

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));
    }
}
