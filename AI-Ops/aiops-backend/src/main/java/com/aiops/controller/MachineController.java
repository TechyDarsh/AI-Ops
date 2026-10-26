package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.Machine;
import com.aiops.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * MACHINE SERVICE — Microservice boundary: Machine Registry & Health Monitoring
 * Handles: CRUD machines, telemetry, health scores, status
 */
@RestController
@RequestMapping("/api/machines")
@CrossOrigin(origins = "*")
public class MachineController {

    @Autowired private MachineRepository machineRepo;

    @GetMapping
    public ResponseEntity<?> getAllMachines(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department) {
        List<Machine> machines;
        if (status != null) {
            machines = machineRepo.findByStatus(Machine.MachineStatus.valueOf(status.toUpperCase()));
        } else if (department != null) {
            machines = machineRepo.findByDepartment(department);
        } else {
            machines = machineRepo.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok(machines));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMachineById(@PathVariable Long id) {
        return machineRepo.findById(id)
            .map(m -> ResponseEntity.ok(ApiResponse.ok(m)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getMachineByCode(@PathVariable String code) {
        return machineRepo.findByMachineCode(code)
            .map(m -> ResponseEntity.ok(ApiResponse.ok(m)))
            .orElse(ResponseEntity.notFound().build());
    }

    /** Simulate live telemetry — in production this comes from MQTT/IoT */
    @GetMapping("/{id}/telemetry")
    public ResponseEntity<?> getTelemetry(@PathVariable Long id) {
        return machineRepo.findById(id).map(m -> {
            double multiplier = m.getStatus() == Machine.MachineStatus.CRITICAL ? 1.25 :
                                m.getStatus() == Machine.MachineStatus.WARNING ? 1.1 : 1.0;
            Map<String, Object> telemetry = new LinkedHashMap<>();
            telemetry.put("machineId", m.getId());
            telemetry.put("machineCode", m.getMachineCode());
            telemetry.put("temperature", Math.round((50 + Math.random() * 40 * multiplier) * 10) / 10.0);
            telemetry.put("vibration", Math.round((0.5 + Math.random() * 3.5 * multiplier) * 100) / 100.0);
            telemetry.put("voltage", Math.round((380 + Math.random() * 40) * 10) / 10.0);
            telemetry.put("current", Math.round((15 + Math.random() * 40 * multiplier) * 10) / 10.0);
            telemetry.put("powerKw", Math.round((5 + Math.random() * 20 * multiplier) * 10) / 10.0);
            telemetry.put("runtimeHours", (int)(Math.random() * 8760));
            telemetry.put("productionCount", (int)(500 + Math.random() * 4500));
            telemetry.put("healthScore", m.getHealthScore());
            telemetry.put("status", m.getStatus());
            telemetry.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.ok(ApiResponse.ok(telemetry));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('MAINTENANCE_ENGINEER')")
    public ResponseEntity<?> createMachine(@RequestBody Machine machine) {
        Machine saved = machineRepo.save(machine);
        return ResponseEntity.ok(ApiResponse.ok("Machine registered successfully", saved));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR') or hasRole('MAINTENANCE_ENGINEER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return machineRepo.findById(id).map(m -> {
            m.setStatus(Machine.MachineStatus.valueOf(body.get("status").toUpperCase()));
            machineRepo.save(m);
            return ResponseEntity.ok(ApiResponse.ok("Status updated", m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats/summary")
    public ResponseEntity<?> getMachineSummary() {
        List<Machine> all = machineRepo.findAll();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("total", all.size());
        summary.put("online", all.stream().filter(m -> m.getStatus() == Machine.MachineStatus.ONLINE).count());
        summary.put("offline", all.stream().filter(m -> m.getStatus() == Machine.MachineStatus.OFFLINE).count());
        summary.put("warning", all.stream().filter(m -> m.getStatus() == Machine.MachineStatus.WARNING).count());
        summary.put("critical", all.stream().filter(m -> m.getStatus() == Machine.MachineStatus.CRITICAL).count());
        summary.put("maintenance", all.stream().filter(m -> m.getStatus() == Machine.MachineStatus.MAINTENANCE).count());
        summary.put("avgHealthScore", all.stream().mapToDouble(Machine::getHealthScore).average().orElse(0));
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
