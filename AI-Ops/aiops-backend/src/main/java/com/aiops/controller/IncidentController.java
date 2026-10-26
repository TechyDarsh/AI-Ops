package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.Incident;
import com.aiops.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * INCIDENT SERVICE — Microservice boundary: Incident Tracking & Resolution
 */
@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    @Autowired private IncidentRepository incidentRepo;

    @GetMapping
    public ResponseEntity<?> getAllIncidents(@RequestParam(required = false) String status) {
        List<Incident> list = status != null
            ? incidentRepo.findByStatus(Incident.IncidentStatus.valueOf(status.toUpperCase()))
            : incidentRepo.findAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncident(@PathVariable Long id) {
        return incidentRepo.findById(id)
            .map(i -> ResponseEntity.ok(ApiResponse.ok(i)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createIncident(@RequestBody Incident incident) {
        long count = incidentRepo.count();
        incident.setIncidentNumber("INC-" + String.format("%07d", count + 1));
        incident.setReportedAt(LocalDateTime.now());
        Incident saved = incidentRepo.save(incident);
        return ResponseEntity.ok(ApiResponse.ok("Incident reported", saved));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<?> resolveIncident(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return incidentRepo.findById(id).map(inc -> {
            inc.setStatus(Incident.IncidentStatus.RESOLVED);
            inc.setRootCause(body.get("rootCause"));
            inc.setResolution(body.get("resolution"));
            inc.setResolvedAt(LocalDateTime.now());
            incidentRepo.save(inc);
            return ResponseEntity.ok(ApiResponse.ok("Incident resolved", inc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", incidentRepo.count());
        stats.put("open", incidentRepo.countByStatus(Incident.IncidentStatus.OPEN));
        stats.put("inProgress", incidentRepo.countByStatus(Incident.IncidentStatus.IN_PROGRESS));
        stats.put("resolved", incidentRepo.countByStatus(Incident.IncidentStatus.RESOLVED));
        stats.put("closed", incidentRepo.countByStatus(Incident.IncidentStatus.CLOSED));
        stats.put("critical", incidentRepo.findBySeverity(Incident.Severity.CRITICAL).size());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
