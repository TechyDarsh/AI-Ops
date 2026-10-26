package com.aiops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiOpsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiOpsApplication.class, args);
    }
}
