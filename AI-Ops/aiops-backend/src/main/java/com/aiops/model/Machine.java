package com.aiops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "machines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "machine_code", nullable = false, unique = true, length = 20)
    private String machineCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String type;

    @Column(length = 100)
    private String department;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MachineStatus status = MachineStatus.ONLINE;

    @Column(name = "serial_no", length = 50)
    private String serialNo;

    @Column(name = "install_date")
    private LocalDate installDate;

    @Column(name = "lifetime_years")
    private Integer lifetimeYears;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(length = 100)
    private String location;

    @Column(name = "health_score")
    @Builder.Default
    private Double healthScore = 100.0;

    @Column(name = "performance_score")
    @Builder.Default
    private Double performanceScore = 100.0;

    @Column(name = "maintenance_status", length = 50)
    private String maintenanceStatus;

    @Column(name = "last_maintenance")
    private LocalDate lastMaintenance;

    @Column(name = "next_maintenance")
    private LocalDate nextMaintenance;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MachineStatus {
        ONLINE, OFFLINE, WARNING, CRITICAL, MAINTENANCE
    }
}
