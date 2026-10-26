package com.aiops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(length = 100)
    private String department;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "mfa_enabled")
    @Builder.Default
    private Boolean mfaEnabled = false;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum UserRole {
        ADMINISTRATOR, MAINTENANCE_ENGINEER, PRODUCTION_MANAGER, OPERATOR, VIEWER
    }
}
