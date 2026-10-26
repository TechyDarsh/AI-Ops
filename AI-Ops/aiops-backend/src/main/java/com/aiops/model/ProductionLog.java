package com.aiops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    @Column(name = "production_date", nullable = false)
    private LocalDate productionDate;

    @Column(length = 20)
    private String shift;

    @Column(name = "units_produced")
    @Builder.Default
    private Integer unitsProduced = 0;

    @Column(name = "units_rejected")
    @Builder.Default
    private Integer unitsRejected = 0;

    @Column(name = "units_target")
    private Integer unitsTarget;

    @Column(name = "efficiency_pct")
    private Double efficiencyPct;

    @Column(name = "runtime_minutes")
    private Integer runtimeMinutes;

    @Column(length = 100)
    private String operator;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
