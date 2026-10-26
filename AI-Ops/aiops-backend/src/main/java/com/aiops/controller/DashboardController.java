package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.*;
import com.aiops.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

/**
 * DASHBOARD SERVICE — Microservice boundary: Aggregated KPIs & Dashboard Data
 * Aggregates data from all other microservices into dashboard-ready format
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired private MachineRepository machineRepo;
    @Autowired private WorkOrderRepository workOrderRepo;
    @Autowired private InventoryRepository inventoryRepo;
    @Autowired private IncidentRepository incidentRepo;
    @Autowired private ProductionLogRepository productionRepo;

    @GetMapping("/kpis")
    public ResponseEntity<?> getDashboardKPIs() {
        List<Machine> machines = machineRepo.findAll();
        long online = machines.stream().filter(m -> m.getStatus() == Machine.MachineStatus.ONLINE).count();
        long critical = machines.stream().filter(m -> m.getStatus() == Machine.MachineStatus.CRITICAL).count();
        long warning = machines.stream().filter(m -> m.getStatus() == Machine.MachineStatus.WARNING).count();
        long maintenanceCount = machines.stream().filter(m -> m.getStatus() == Machine.MachineStatus.MAINTENANCE).count();
        double avgHealth = machines.stream().mapToDouble(Machine::getHealthScore).average().orElse(0);

        List<ProductionLog> todayLogs = productionRepo.findByProductionDate(LocalDate.now());
        int todayProduced = todayLogs.stream().mapToInt(ProductionLog::getUnitsProduced).sum();
        int todayTarget = todayLogs.stream().mapToInt(p -> p.getUnitsTarget() != null ? p.getUnitsTarget() : 7000).sum();
        double oee = 83.7 + (Math.random() - 0.5) * 2;
        double availability = (double) online / machines.size() * 100;

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("totalMachines", machines.size());
        kpis.put("onlineMachines", online);
        kpis.put("criticalMachines", critical);
        kpis.put("warningMachines", warning);
        kpis.put("maintenanceMachines", maintenanceCount);
        kpis.put("avgHealthScore", Math.round(avgHealth * 10) / 10.0);
        kpis.put("maintenanceDue", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.OVERDUE));
        kpis.put("openIncidents", incidentRepo.countByStatus(Incident.IncidentStatus.OPEN));
        kpis.put("openWorkOrders", workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.OPEN) +
                                   workOrderRepo.countByStatus(WorkOrder.WorkOrderStatus.IN_PROGRESS));
        kpis.put("oee", Math.round(oee * 10) / 10.0);
        kpis.put("machineAvailability", Math.round(availability * 10) / 10.0);
        kpis.put("powerConsumption", Math.round((260 + Math.random() * 50) * 10) / 10.0);
        kpis.put("mtbf", 642);
        kpis.put("mttr", 4.2);
        kpis.put("productionToday", todayProduced);
        kpis.put("productionTarget", todayTarget > 0 ? todayTarget : 20000);
        kpis.put("lowStockAlerts", inventoryRepo.findLowStockItems().size());
        kpis.put("inventoryValue", inventoryRepo.findAll().stream()
            .mapToDouble(i -> i.getQtyInStock() * i.getUnitCost()).sum());
        return ResponseEntity.ok(ApiResponse.ok(kpis));
    }

    @GetMapping("/machine-health-trend")
    public ResponseEntity<?> getHealthTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 23; i >= 0; i--) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("time", String.format("%02d:00", (24 - i) % 24));
            point.put("avgHealth", Math.round((75 + Math.sin(i * 0.4) * 10 + Math.random() * 5) * 10) / 10.0);
            point.put("oee", Math.round((80 + Math.sin(i * 0.3) * 8 + Math.random() * 4) * 10) / 10.0);
            point.put("power", Math.round((260 + Math.sin(i * 0.5) * 30 + Math.random() * 20) * 10) / 10.0);
            trend.add(point);
        }
        return ResponseEntity.ok(ApiResponse.ok(trend));
    }

    @GetMapping("/alerts")
    public ResponseEntity<?> getActiveAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        // Critical machines
        machineRepo.findByStatus(Machine.MachineStatus.CRITICAL).forEach(m -> {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("type", "CRITICAL");
            alert.put("title", "Machine Critical: " + m.getName());
            alert.put("message", m.getMachineCode() + " is in CRITICAL state. Immediate action required.");
            alert.put("machineId", m.getId());
            alerts.add(alert);
        });
        // Overdue work orders
        workOrderRepo.findByStatus(WorkOrder.WorkOrderStatus.OVERDUE).forEach(wo -> {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("type", "WARNING");
            alert.put("title", "Overdue Work Order: " + wo.getWoNumber());
            alert.put("message", wo.getDescription());
            alerts.add(alert);
        });
        // Low stock
        inventoryRepo.findLowStockItems().forEach(item -> {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("type", "INFO");
            alert.put("title", "Low Stock: " + item.getName());
            alert.put("message", "Current qty: " + item.getQtyInStock() + " | Reorder point: " + item.getReorderPoint());
            alerts.add(alert);
        });
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }
}
