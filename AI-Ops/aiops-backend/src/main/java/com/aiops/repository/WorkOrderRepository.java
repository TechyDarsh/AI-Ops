package com.aiops.repository;

import com.aiops.model.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByStatus(WorkOrder.WorkOrderStatus status);
    List<WorkOrder> findByMachineId(Long machineId);
    List<WorkOrder> findByAssignedTo(String assignedTo);
    List<WorkOrder> findByPriority(WorkOrder.Priority priority);
    long countByStatus(WorkOrder.WorkOrderStatus status);
}
