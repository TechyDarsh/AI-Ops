package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.*;
import com.aiops.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * MAINTENANCE SERVICE — Microservice boundary: Work Orders & Maintenance Planning
 * Handles: CRUD work orders, status updates, stats
 */
@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    @Autowired private WorkOrderRepository workOrderRepo;
    @Autowired private MachineRepository machineRepo;

    @GetMapping("/work-orders")
    public ResponseEntity<?> getAllWorkOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        List<WorkOrder> list;
        if (status != null) {
            list = workOrderRepo.findByStatus(WorkOrder.WorkOrderStatus.valueOf(status.toUpperCase()));
        } else if (priority != null) {
            list = workOrderRepo.findByPriority(WorkOrder.Priority.valueOf(priority.toUpperCase()));
        } else {
            list = workOrderRepo.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/work-orders/{id}")
    public ResponseEntity<?> getWorkOrderById(@PathVariable Long id) {
        return workOrderRepo.findById(id)
            .map(wo -> ResponseEntity.ok(ApiResponse.ok(wo)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/work-orders")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('MAINTENANCE_ENGINEER')")
    public ResponseEntity<?> createWorkOrder(@RequestBody WorkOrder workOrder) {
        // Auto-assign WO number
        long count = workOrderRepo.count();
        workOrder.setWoNumber("WO-" + String.format("%04d", count + 1000));
        WorkOrder saved = workOrderRepo.save(workOrder);
        return ResponseEntity.ok(ApiResponse.ok("Work order created", saved));
    }

    @PatchMapping("/work-orders/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('MAINTENANCE_ENGINEER')")
    public ResponseEntity<?> updateWorkOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return workOrderRepo.findById(id).map(wo -> {
            WorkOrder.WorkOrderStatus newStatus = WorkOrder.WorkOrderStatus.valueOf(body.get("status").toUpperCase());
            wo.setStatus(newStatus);
            if (newStatus == WorkOrder.WorkOrderStatus.COMPLETED) {
                wo.setCompletedAt(LocalDateTime.now());
                if (body.containsKey("resolutionNotes")) {
                    wo.setResolutionNotes(body.get("resolutionNotes"));
                }
            }
            workOrderRepo.save(wo);
            return ResponseEntity.ok(ApiResponse.ok("Work order updated", wo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getMaintenanceStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", workOrderRepo.count());
        stats.put("open", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.OPEN));
        stats.put("inProgress", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.IN_PROGRESS));
        stats.put("scheduled", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.SCHEDULED));
        stats.put("completed", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.COMPLETED));
        stats.put("overdue", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.OVERDUE));
        double totalCost = workOrderRepo.findAll().stream()
            .filter(wo -> wo.getCost() != null).mapToDouble(WorkOrder::getCost).sum();
        stats.put("totalCostMtd", totalCost);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
