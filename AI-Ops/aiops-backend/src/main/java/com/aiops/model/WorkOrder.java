package com.aiops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wo_number", nullable = false, unique = true, length = 20)
    private String woNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    @Enumerated(EnumType.STRING)
    private WorkOrderType type;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private WorkOrderStatus status = WorkOrderStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "estimated_hours")
    private Double estimatedHours;

    @Column(name = "actual_hours")
    private Double actualHours;

    @Column(name = "cost")
    private Double cost;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum WorkOrderType { PREVENTIVE, CORRECTIVE, PREDICTIVE, EMERGENCY }
    public enum WorkOrderStatus { OPEN, IN_PROGRESS, SCHEDULED, COMPLETED, OVERDUE }
    public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
}
