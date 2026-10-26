package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.ProductionLog;
import com.aiops.repository.ProductionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

/**
 * PRODUCTION SERVICE — Microservice boundary: Production KPIs & Shift Management
 */
@RestController
@RequestMapping("/api/production")
@CrossOrigin(origins = "*")
public class ProductionController {

    @Autowired private ProductionLogRepository productionRepo;

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam(required = false) String date) {
        List<ProductionLog> logs = date != null
            ? productionRepo.findByProductionDate(LocalDate.parse(date))
            : productionRepo.findAll();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodaySummary() {
        LocalDate today = LocalDate.now();
        List<ProductionLog> todayLogs = productionRepo.findByProductionDate(today);
        Map<String, Object> summary = new LinkedHashMap<>();
        int totalProduced = todayLogs.stream().mapToInt(ProductionLog::getUnitsProduced).sum();
        int totalRejected = todayLogs.stream().mapToInt(ProductionLog::getUnitsRejected).sum();
        int totalTarget = todayLogs.stream().mapToInt(p -> p.getUnitsTarget() != null ? p.getUnitsTarget() : 0).sum();
        summary.put("date", today.toString());
        summary.put("totalProduced", totalProduced);
        summary.put("totalRejected", totalRejected);
        summary.put("totalTarget", totalTarget);
        summary.put("achievementPct", totalTarget > 0 ? Math.round((double) totalProduced / totalTarget * 1000) / 10.0 : 0);
        summary.put("rejectionRate", totalProduced > 0 ? Math.round((double) totalRejected / totalProduced * 1000) / 10.0 : 0);
        summary.put("shifts", todayLogs);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyData() {
        // Generate last 30 days data
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            List<ProductionLog> logs = productionRepo.findByProductionDate(date);
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", date.toString());
            day.put("produced", logs.stream().mapToInt(ProductionLog::getUnitsProduced).sum());
            day.put("rejected", logs.stream().mapToInt(ProductionLog::getUnitsRejected).sum());
            data.add(day);
        }
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping("/logs")
    public ResponseEntity<?> createLog(@RequestBody ProductionLog log) {
        log.setCreatedAt(java.time.LocalDateTime.now());
        ProductionLog saved = productionRepo.save(log);
        return ResponseEntity.ok(ApiResponse.ok("Production log saved", saved));
    }
}
