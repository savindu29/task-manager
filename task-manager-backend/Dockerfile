# syntax=docker/dockerfile:1

# ---- build stage: compile and package the Spring Boot jar ----
# Also reused as the "test" target in docker-compose.ci.yml (runs `mvn test`
# against a throwaway Postgres).
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies first (only re-runs when pom.xml changes).
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
# Tests run in a separate CI stage (they need a database); skip them here so
# the image build is fast and does not require a DB.
RUN mvn -B -ntp clean package -DskipTests

# ---- runtime stage: slim JRE with just the jar ----
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Run as a non-root user.
RUN groupadd -r spring && useradd -r -g spring spring
COPY --from=build /app/target/task-manager-backend-*.jar app.jar
USER spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
