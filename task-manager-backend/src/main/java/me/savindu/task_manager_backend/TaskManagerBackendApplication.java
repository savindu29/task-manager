package me.savindu.task_manager_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TaskManagerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskManagerBackendApplication.class, args);
	}

}
