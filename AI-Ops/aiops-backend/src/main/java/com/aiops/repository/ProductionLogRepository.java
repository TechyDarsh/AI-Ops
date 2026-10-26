package com.aiops.repository;

import com.aiops.model.ProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductionLogRepository extends JpaRepository<ProductionLog, Long> {
    List<ProductionLog> findByProductionDate(LocalDate date);
    List<ProductionLog> findByMachineId(Long machineId);

    @Query("SELECT SUM(p.unitsProduced) FROM ProductionLog p WHERE p.productionDate = :date")
    Integer sumProductionByDate(LocalDate date);

    @Query("SELECT p.shift, SUM(p.unitsProduced), SUM(p.unitsRejected), AVG(p.efficiencyPct) " +
           "FROM ProductionLog p WHERE p.productionDate = :date GROUP BY p.shift")
    List<Object[]> getShiftSummaryByDate(LocalDate date);
}
