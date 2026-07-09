package me.savindu.task_manager_backend;

import com.jayway.jsonpath.JsonPath;
import me.savindu.task_manager_backend.dto.LoginRequest;
import me.savindu.task_manager_backend.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

/**
 * Base for integration tests: boots the full app against an in-memory H2
 * database (via the "test" profile) and exposes MockMvc plus auth helpers.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class AbstractIntegrationTest {

    protected static final MediaType JSON = MediaType.APPLICATION_JSON;

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected String json(Object value) {
        return objectMapper.writeValueAsString(value);
    }

    protected String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    /** Reads a numeric id from the response body's `data.id`. */
    protected long idOf(MvcResult result) throws Exception {
        Number id = JsonPath.read(result.getResponse().getContentAsString(), "$.data.id");
        return id.longValue();
    }

    /** Registers a fresh USER and returns its JWT. */
    protected String register(String name, String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(JSON)
                        .content(json(new RegisterRequest(name, email, password))))
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();
        return tokenOf(result);
    }

    /** Logs in and returns the JWT. */
    protected String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(JSON)
                        .content(json(new LoginRequest(email, password))))
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();
        return tokenOf(result);
    }

    /** JWT for the bootstrap admin seeded from the test profile. */
    protected String adminToken() throws Exception {
        return login("admin@example.com", "Admin@12345");
    }

    private String tokenOf(MvcResult result) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), "$.data.token");
    }
}
