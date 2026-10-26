package com.aiops.config;

import com.aiops.model.*;
import com.aiops.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    @Autowired private UserRepository userRepo;
    @Autowired private MachineRepository machineRepo;
    @Autowired private WorkOrderRepository workOrderRepo;
    @Autowired private InventoryRepository inventoryRepo;
    @Autowired private IncidentRepository incidentRepo;
    @Autowired private ProductionLogRepository productionRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("=== AI-Ops Data Loader: Seeding database with industrial data ===");
        loadUsers();
        loadMachines();
        loadWorkOrders();
        loadInventory();
        loadIncidents();
        loadProductionLogs();
        log.info("=== Data Loading Complete ===");
    }

    private void loadUsers() {
        userRepo.save(User.builder().name("Admin User").email("admin@aiops.com")
            .password(passwordEncoder.encode("admin123")).role(User.UserRole.ADMINISTRATOR)
            .department("IT").mfaEnabled(true).lastLogin(LocalDateTime.now()).build());
        userRepo.save(User.builder().name("John Smith").email("engineer@aiops.com")
            .password(passwordEncoder.encode("eng123")).role(User.UserRole.MAINTENANCE_ENGINEER)
            .department("Maintenance").mfaEnabled(true).build());
        userRepo.save(User.builder().name("Sarah Connor").email("manager@aiops.com")
            .password(passwordEncoder.encode("mgr123")).role(User.UserRole.PRODUCTION_MANAGER)
            .department("Production").build());
        userRepo.save(User.builder().name("Mike Torres").email("mike@aiops.com")
            .password(passwordEncoder.encode("eng123")).role(User.UserRole.MAINTENANCE_ENGINEER)
            .department("Maintenance").mfaEnabled(true).build());
        userRepo.save(User.builder().name("Emily Chen").email("emily@aiops.com")
            .password(passwordEncoder.encode("op123")).role(User.UserRole.OPERATOR)
            .department("Production Line A").build());
        userRepo.save(User.builder().name("Raj Patel").email("raj@aiops.com")
            .password(passwordEncoder.encode("op123")).role(User.UserRole.OPERATOR)
            .department("Production Line B").isActive(false).build());
        userRepo.save(User.builder().name("Lisa Wang").email("lisa@aiops.com")
            .password(passwordEncoder.encode("view123")).role(User.UserRole.VIEWER)
            .department("Quality Control").build());
        log.info("Loaded {} users", userRepo.count());
    }

    private void loadMachines() {
        Machine[] machines = {
            Machine.builder().machineCode("MCH-001").name("CNC Mill Alpha").type("CNC Milling Machine")
                .department("Production Line A").status(Machine.MachineStatus.ONLINE).serialNo("SN-CNC-2021-001")
                .installDate(LocalDate.of(2021,3,15)).lifetimeYears(20).warrantyExpiry(LocalDate.of(2026,3,15))
                .location("Bay 1, Floor 1").healthScore(92.0).performanceScore(88.0)
                .maintenanceStatus("Good").lastMaintenance(LocalDate.of(2026,6,15)).nextMaintenance(LocalDate.of(2026,9,15)).build(),
            Machine.builder().machineCode("MCH-002").name("Hydraulic Press Beta").type("Hydraulic Press")
                .department("Production Line B").status(Machine.MachineStatus.WARNING).serialNo("SN-HP-2020-002")
                .installDate(LocalDate.of(2020,7,20)).lifetimeYears(15).warrantyExpiry(LocalDate.of(2025,7,20))
                .location("Bay 2, Floor 1").healthScore(67.0).performanceScore(71.0)
                .maintenanceStatus("Due Soon").lastMaintenance(LocalDate.of(2026,4,10)).nextMaintenance(LocalDate.of(2026,7,10)).build(),
            Machine.builder().machineCode("MCH-003").name("Robot Arm Gamma").type("Industrial Robot Arm")
                .department("Assembly").status(Machine.MachineStatus.ONLINE).serialNo("SN-RA-2022-003")
                .installDate(LocalDate.of(2022,1,10)).lifetimeYears(25).warrantyExpiry(LocalDate.of(2027,1,10))
                .location("Bay 3, Floor 2").healthScore(96.0).performanceScore(94.0)
                .maintenanceStatus("Good").lastMaintenance(LocalDate.of(2026,6,1)).nextMaintenance(LocalDate.of(2026,9,1)).build(),
            Machine.builder().machineCode("MCH-004").name("Conveyor Delta").type("Conveyor System")
                .department("Production Line A").status(Machine.MachineStatus.ONLINE).serialNo("SN-CV-2019-004")
                .installDate(LocalDate.of(2019,11,5)).lifetimeYears(10).warrantyExpiry(LocalDate.of(2024,11,5))
                .location("Bay 1-4, Floor 1").healthScore(78.0).performanceScore(82.0)
                .maintenanceStatus("Scheduled").lastMaintenance(LocalDate.of(2026,5,20)).nextMaintenance(LocalDate.of(2026,8,20)).build(),
            Machine.builder().machineCode("MCH-005").name("Air Comp Epsilon").type("Air Compressor")
                .department("Utilities").status(Machine.MachineStatus.ONLINE).serialNo("SN-AC-2021-005")
                .installDate(LocalDate.of(2021,6,12)).lifetimeYears(12).warrantyExpiry(LocalDate.of(2026,6,12))
                .location("Utility Room A").healthScore(89.0).performanceScore(91.0)
                .maintenanceStatus("Good").lastMaintenance(LocalDate.of(2026,6,20)).nextMaintenance(LocalDate.of(2026,9,20)).build(),
            Machine.builder().machineCode("MCH-006").name("Laser Cutter Zeta").type("Laser Cutter")
                .department("Production Line B").status(Machine.MachineStatus.CRITICAL).serialNo("SN-LC-2020-006")
                .installDate(LocalDate.of(2020,9,8)).lifetimeYears(15).warrantyExpiry(LocalDate.of(2025,9,8))
                .location("Bay 5, Floor 1").healthScore(45.0).performanceScore(38.0)
                .maintenanceStatus("Critical").lastMaintenance(LocalDate.of(2026,3,1)).nextMaintenance(LocalDate.of(2026,6,1)).build(),
            Machine.builder().machineCode("MCH-007").name("Injection Molder Eta").type("Injection Molder")
                .department("Production Line A").status(Machine.MachineStatus.ONLINE).serialNo("SN-IM-2022-007")
                .installDate(LocalDate.of(2022,4,18)).lifetimeYears(20).warrantyExpiry(LocalDate.of(2027,4,18))
                .location("Bay 6, Floor 2").healthScore(85.0).performanceScore(87.0)
                .maintenanceStatus("Good").lastMaintenance(LocalDate.of(2026,5,30)).nextMaintenance(LocalDate.of(2026,8,30)).build(),
            Machine.builder().machineCode("MCH-008").name("Furnace Theta").type("Heat Treatment Furnace")
                .department("Production Line B").status(Machine.MachineStatus.MAINTENANCE).serialNo("SN-HF-2019-008")
                .installDate(LocalDate.of(2019,2,28)).lifetimeYears(20).warrantyExpiry(LocalDate.of(2024,2,28))
                .location("Bay 7, Floor 1").healthScore(55.0).performanceScore(60.0)
                .maintenanceStatus("Under Maintenance").lastMaintenance(LocalDate.of(2026,7,1)).nextMaintenance(LocalDate.of(2026,7,15)).build(),
            Machine.builder().machineCode("MCH-009").name("Packaging Iota").type("Packaging Machine")
                .department("Packaging").status(Machine.MachineStatus.ONLINE).serialNo("SN-PM-2023-009")
                .installDate(LocalDate.of(2023,1,25)).lifetimeYears(10).warrantyExpiry(LocalDate.of(2028,1,25))
                .location("Packaging Hall").healthScore(98.0).performanceScore(96.0)
                .maintenanceStatus("Excellent").lastMaintenance(LocalDate.of(2026,7,1)).nextMaintenance(LocalDate.of(2026,10,1)).build(),
            Machine.builder().machineCode("MCH-010").name("Assembly Kappa").type("Assembly Station")
                .department("Assembly").status(Machine.MachineStatus.ONLINE).serialNo("SN-AS-2021-010")
                .installDate(LocalDate.of(2021,8,14)).lifetimeYears(15).warrantyExpiry(LocalDate.of(2026,8,14))
                .location("Assembly Floor").healthScore(82.0).performanceScore(80.0)
                .maintenanceStatus("Good").lastMaintenance(LocalDate.of(2026,6,10)).nextMaintenance(LocalDate.of(2026,9,10)).build(),
            Machine.builder().machineCode("MCH-011").name("Quality Scanner Lambda").type("Quality Scanner")
                .department("Quality Control").status(Machine.MachineStatus.ONLINE).serialNo("SN-QS-2022-011")
                .installDate(LocalDate.of(2022,11,3)).lifetimeYears(8).warrantyExpiry(LocalDate.of(2027,11,3))
                .location("QC Lab").healthScore(94.0).performanceScore(97.0)
                .maintenanceStatus("Good").lastMaintenance(LocalDate.of(2026,6,25)).nextMaintenance(LocalDate.of(2026,9,25)).build(),
            Machine.builder().machineCode("MCH-012").name("Pump Station Mu").type("Industrial Pump")
                .department("Utilities").status(Machine.MachineStatus.WARNING).serialNo("SN-IP-2020-012")
                .installDate(LocalDate.of(2020,12,1)).lifetimeYears(10).warrantyExpiry(LocalDate.of(2025,12,1))
                .location("Utility Room B").healthScore(62.0).performanceScore(68.0)
                .maintenanceStatus("Due Soon").lastMaintenance(LocalDate.of(2026,4,20)).nextMaintenance(LocalDate.of(2026,7,20)).build()
        };
        machineRepo.saveAll(java.util.Arrays.asList(machines));
        log.info("Loaded {} machines", machineRepo.count());
    }

    private void loadWorkOrders() {
        java.util.List<Machine> ms = machineRepo.findAll();
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1001").machine(ms.get(0))
            .type(WorkOrder.WorkOrderType.PREVENTIVE).status(WorkOrder.WorkOrderStatus.COMPLETED).priority(WorkOrder.Priority.MEDIUM)
            .assignedTo("John Smith").description("Quarterly preventive maintenance — lubrication, alignment check")
            .scheduledDate(LocalDate.of(2026,6,15)).estimatedHours(6.0).actualHours(5.5).cost(2400.0)
            .resolutionNotes("Completed successfully. All parameters nominal.").completedAt(LocalDateTime.of(2026,6,15,14,30)).build());
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1002").machine(ms.get(1))
            .type(WorkOrder.WorkOrderType.CORRECTIVE).status(WorkOrder.WorkOrderStatus.IN_PROGRESS).priority(WorkOrder.Priority.HIGH)
            .assignedTo("Mike Torres").description("Hydraulic seal replacement — pressure drop below threshold")
            .scheduledDate(LocalDate.of(2026,7,8)).estimatedHours(8.0).cost(3800.0).build());
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1003").machine(ms.get(5))
            .type(WorkOrder.WorkOrderType.EMERGENCY).status(WorkOrder.WorkOrderStatus.IN_PROGRESS).priority(WorkOrder.Priority.CRITICAL)
            .assignedTo("John Smith").description("CRITICAL: Spindle bearing replacement — vibration 340% above limit")
            .scheduledDate(LocalDate.of(2026,7,6)).estimatedHours(12.0).cost(7500.0).build());
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1004").machine(ms.get(7))
            .type(WorkOrder.WorkOrderType.PREVENTIVE).status(WorkOrder.WorkOrderStatus.IN_PROGRESS).priority(WorkOrder.Priority.MEDIUM)
            .assignedTo("Mike Torres").description("Scheduled furnace refractory inspection and thermocouple calibration")
            .scheduledDate(LocalDate.of(2026,7,1)).estimatedHours(16.0).cost(4200.0).build());
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1005").machine(ms.get(11))
            .type(WorkOrder.WorkOrderType.PREDICTIVE).status(WorkOrder.WorkOrderStatus.SCHEDULED).priority(WorkOrder.Priority.HIGH)
            .assignedTo("John Smith").description("Predictive: Bearing wear detected via vibration analysis")
            .scheduledDate(LocalDate.of(2026,7,13)).estimatedHours(4.0).cost(2100.0).build());
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1006").machine(ms.get(3))
            .type(WorkOrder.WorkOrderType.PREVENTIVE).status(WorkOrder.WorkOrderStatus.SCHEDULED).priority(WorkOrder.Priority.LOW)
            .assignedTo("Mike Torres").description("Conveyor belt tension check and roller lubrication")
            .scheduledDate(LocalDate.of(2026,8,20)).estimatedHours(3.0).cost(800.0).build());
        workOrderRepo.save(WorkOrder.builder().woNumber("WO-1007").machine(ms.get(1))
            .type(WorkOrder.WorkOrderType.CORRECTIVE).status(WorkOrder.WorkOrderStatus.OVERDUE).priority(WorkOrder.Priority.HIGH)
            .assignedTo("Sarah Connor").description("Hydraulic pump replacement — overdue by 3 days")
            .scheduledDate(LocalDate.of(2026,7,3)).estimatedHours(6.0).cost(5200.0).build());
        log.info("Loaded {} work orders", workOrderRepo.count());
    }

    private void loadInventory() {
        inventoryRepo.save(InventoryItem.builder().sku("BRG-6205").name("Deep Groove Ball Bearing 6205")
            .category("Bearings").qtyInStock(48).minQty(20).maxQty(100).reorderPoint(30).unitCost(12.50).supplier("SKF Industrial").build());
        inventoryRepo.save(InventoryItem.builder().sku("HSK-001A").name("Hydraulic Seal Kit Type A")
            .category("Seals & Gaskets").qtyInStock(12).minQty(10).maxQty(50).reorderPoint(15).unitCost(45.00).supplier("Parker Hannifin").build());
        inventoryRepo.save(InventoryItem.builder().sku("HYP-P100").name("Hydraulic Pump P100")
            .category("Hydraulic Parts").qtyInStock(3).minQty(2).maxQty(8).reorderPoint(3).unitCost(890.00).supplier("Bosch Rexroth").build());
        inventoryRepo.save(InventoryItem.builder().sku("MTR-15K").name("3-Phase Motor 15kW")
            .category("Electrical").qtyInStock(2).minQty(1).maxQty(5).reorderPoint(2).unitCost(1250.00).supplier("ABB Motors").build());
        inventoryRepo.save(InventoryItem.builder().sku("FLT-F200").name("Industrial Air Filter F200")
            .category("Filters").qtyInStock(35).minQty(15).maxQty(60).reorderPoint(20).unitCost(18.00).supplier("Donaldson Co.").build());
        inventoryRepo.save(InventoryItem.builder().sku("VBT-B1500").name("V-Belt B-Section 1500")
            .category("Belts & Chains").qtyInStock(22).minQty(10).maxQty(40).reorderPoint(15).unitCost(8.75).supplier("Gates Belts").build());
        inventoryRepo.save(InventoryItem.builder().sku("OIL-VG220").name("Gear Oil ISO VG 220")
            .category("Lubricants").qtyInStock(8).minQty(5).maxQty(20).reorderPoint(8).unitCost(65.00).supplier("Shell Lubricants").build());
        inventoryRepo.save(InventoryItem.builder().sku("PLC-S7300").name("PLC Module Siemens S7-300")
            .category("Electrical").qtyInStock(4).minQty(2).maxQty(8).reorderPoint(3).unitCost(2100.00).supplier("Siemens AG").build());
        inventoryRepo.save(InventoryItem.builder().sku("CPM-50").name("Coolant Pump CP-50")
            .category("Hydraulic Parts").qtyInStock(6).minQty(3).maxQty(12).reorderPoint(4).unitCost(320.00).supplier("Grundfos").build());
        inventoryRepo.save(InventoryItem.builder().sku("SNS-PNP24").name("Proximity Sensor PNP 24V")
            .category("Electrical").qtyInStock(55).minQty(20).maxQty(80).reorderPoint(30).unitCost(22.00).supplier("IFM Electronic").build());
        log.info("Loaded {} inventory items", inventoryRepo.count());
    }

    private void loadIncidents() {
        java.util.List<Machine> ms = machineRepo.findAll();
        incidentRepo.save(Incident.builder().incidentNumber("INC-2024001").machine(ms.get(5))
            .severity(Incident.Severity.CRITICAL).status(Incident.IncidentStatus.IN_PROGRESS)
            .description("Vibration levels 340% above safety threshold on spindle bearing")
            .reportedBy("Sensor Auto").assignedTo("John Smith").reportedAt(LocalDateTime.now().minusHours(2)).build());
        incidentRepo.save(Incident.builder().incidentNumber("INC-2024002").machine(ms.get(1))
            .severity(Incident.Severity.HIGH).status(Incident.IncidentStatus.IN_PROGRESS)
            .description("Hydraulic pressure drop below minimum operational threshold (150 bar)")
            .reportedBy("Operator A").assignedTo("Mike Torres").reportedAt(LocalDateTime.now().minusDays(1)).build());
        incidentRepo.save(Incident.builder().incidentNumber("INC-2024003").machine(ms.get(11))
            .severity(Incident.Severity.MEDIUM).status(Incident.IncidentStatus.OPEN)
            .description("Abnormal noise from pump bearings — possible early wear detected")
            .reportedBy("Emily Chen").assignedTo("John Smith").reportedAt(LocalDateTime.now().minusDays(2)).build());
        incidentRepo.save(Incident.builder().incidentNumber("INC-2024004").machine(ms.get(0))
            .severity(Incident.Severity.LOW).status(Incident.IncidentStatus.RESOLVED)
            .description("Coolant temperature slightly elevated — cooling circuit check required")
            .reportedBy("Sensor Auto").assignedTo("Mike Torres")
            .rootCause("Clogged coolant filter — replaced with new unit FLT-F200")
            .resolution("Coolant filter replaced. Temperature normalized within 30 minutes.")
            .reportedAt(LocalDateTime.now().minusDays(5)).resolvedAt(LocalDateTime.now().minusDays(4)).build());
        incidentRepo.save(Incident.builder().incidentNumber("INC-2024005").machine(ms.get(7))
            .severity(Incident.Severity.MEDIUM).status(Incident.IncidentStatus.CLOSED)
            .description("Furnace temperature fluctuation during heat cycle — ±15°C variance")
            .reportedBy("Shift Lead").assignedTo("John Smith")
            .rootCause("Thermocouple calibration drift — recalibrated during scheduled maintenance")
            .resolution("Thermocouple replaced and recalibrated. Within spec.")
            .reportedAt(LocalDateTime.now().minusDays(10)).resolvedAt(LocalDateTime.now().minusDays(8)).build());
        log.info("Loaded {} incidents", incidentRepo.count());
    }

    private void loadProductionLogs() {
        java.util.List<Machine> ms = machineRepo.findAll();
        LocalDate today = LocalDate.now();
        String[] shifts = {"DAY", "EVENING", "NIGHT"};
        int[][] data = {{6200, 45, 7000}, {5800, 62, 7000}, {4200, 38, 6000}};
        String[] operators = {"Emily Chen", "Raj Patel", "Operator Night"};
        for (int i = 0; i < 3; i++) {
            productionRepo.save(ProductionLog.builder().machine(ms.get(0)).productionDate(today)
                .shift(shifts[i]).unitsProduced(data[i][0]).unitsRejected(data[i][1]).unitsTarget(data[i][2])
                .efficiencyPct((double) data[i][0] / data[i][2] * 100).runtimeMinutes(480).operator(operators[i]).build());
        }
        for (int day = 1; day <= 30; day++) {
            productionRepo.save(ProductionLog.builder().machine(ms.get(0))
                .productionDate(today.minusDays(day)).shift("DAY")
                .unitsProduced(5500 + (int)(Math.random() * 2000))
                .unitsRejected((int)(Math.random() * 100))
                .unitsTarget(7000).efficiencyPct(75 + Math.random() * 20)
                .runtimeMinutes(480).operator("Emily Chen").build());
        }
        log.info("Loaded {} production logs", productionRepo.count());
    }
}
