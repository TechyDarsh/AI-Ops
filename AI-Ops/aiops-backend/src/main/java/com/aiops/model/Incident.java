package com.aiops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_number", nullable = false, unique = true, length = 20)
    private String incidentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Severity severity = Severity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reported_by", length = 100)
    private String reportedBy;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "reported_at")
    @Builder.Default
    private LocalDateTime reportedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public enum Severity { LOW, MEDIUM, HIGH, CRITICAL }
    public enum IncidentStatus { OPEN, IN_PROGRESS, RESOLVED, CLOSED }
}
