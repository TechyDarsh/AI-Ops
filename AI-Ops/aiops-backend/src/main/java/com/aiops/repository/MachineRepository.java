package com.aiops.repository;

import com.aiops.model.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByStatus(Machine.MachineStatus status);
    Optional<Machine> findByMachineCode(String machineCode);
    List<Machine> findByDepartment(String department);
}
