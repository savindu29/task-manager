package me.savindu.task_manager_backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** OpenAPI / Swagger UI metadata; declares the HTTP-only auth cookie as the security scheme. */
@Configuration
@RequiredArgsConstructor
public class OpenApiConfig {

    private static final String COOKIE_AUTH = "cookieAuth";

    private final CookieProperties cookieProperties;

    @Bean
    public OpenAPI taskManagerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Task Manager API")
                        .version("v1")
                        .description("""
                                Task Manager backend API.

                                Authentication uses a JWT stored in an HTTP-only cookie.
                                Call POST /api/auth/login (or /api/auth/register) to receive
                                the cookie; subsequent requests are authenticated automatically.

                                Roles: USER (own tasks) and ADMIN (all tasks).""")
                        .contact(new Contact().name("Task Manager").email("example@arktide.io"))
                        .license(new License().name("Proprietary")))
                .components(new Components()
                        .addSecuritySchemes(COOKIE_AUTH, new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name(cookieProperties.name())
                                .description("JWT access token stored in an HTTP-only cookie")))
                .addSecurityItem(new SecurityRequirement().addList(COOKIE_AUTH));
    }
}
