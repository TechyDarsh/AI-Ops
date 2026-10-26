package com.aiops.repository;

import com.aiops.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(Incident.IncidentStatus status);
    List<Incident> findByMachineId(Long machineId);
    List<Incident> findBySeverity(Incident.Severity severity);
    long countByStatus(Incident.IncidentStatus status);
}
