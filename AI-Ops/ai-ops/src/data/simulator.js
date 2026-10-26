// ============================================================
// AI-Ops Industrial Data Simulator
// Generates realistic industrial telemetry for 12 machines
// ============================================================

export const MACHINE_TYPES = [
  'CNC Milling Machine', 'Hydraulic Press', 'Industrial Robot Arm', 'Conveyor System',
  'Air Compressor', 'Industrial Pump', 'Laser Cutter', 'Injection Molder',
  'Heat Treatment Furnace', 'Packaging Machine', 'Assembly Station', 'Quality Scanner'
];

export const DEPARTMENTS = [
  'Production Line A', 'Production Line B', 'Assembly', 'Quality Control',
  'Maintenance Shop', 'Utilities', 'Packaging', 'R&D'
];

export const MACHINE_STATUSES = ['Online', 'Offline', 'Maintenance', 'Warning', 'Critical'];

export const machines = [
  { id: 'MCH-001', name: 'CNC Mill Alpha', type: 'CNC Milling Machine', department: 'Production Line A', status: 'Online', serialNo: 'SN-CNC-2021-001', installDate: '2021-03-15', lifetime: 20, warranty: '2026-03-15', location: 'Bay 1, Floor 1', healthScore: 92, performanceScore: 88, maintenanceStatus: 'Good', lastMaintenance: '2026-06-15', nextMaintenance: '2026-09-15' },
  { id: 'MCH-002', name: 'Hydraulic Press Beta', type: 'Hydraulic Press', department: 'Production Line B', status: 'Warning', serialNo: 'SN-HP-2020-002', installDate: '2020-07-20', lifetime: 15, warranty: '2025-07-20', location: 'Bay 2, Floor 1', healthScore: 67, performanceScore: 71, maintenanceStatus: 'Due Soon', lastMaintenance: '2026-04-10', nextMaintenance: '2026-07-10' },
  { id: 'MCH-003', name: 'Robot Arm Gamma', type: 'Industrial Robot Arm', department: 'Assembly', status: 'Online', serialNo: 'SN-RA-2022-003', installDate: '2022-01-10', lifetime: 25, warranty: '2027-01-10', location: 'Bay 3, Floor 2', healthScore: 96, performanceScore: 94, maintenanceStatus: 'Good', lastMaintenance: '2026-06-01', nextMaintenance: '2026-09-01' },
  { id: 'MCH-004', name: 'Conveyor Delta', type: 'Conveyor System', department: 'Production Line A', status: 'Online', serialNo: 'SN-CV-2019-004', installDate: '2019-11-05', lifetime: 10, warranty: '2024-11-05', location: 'Bay 1-4, Floor 1', healthScore: 78, performanceScore: 82, maintenanceStatus: 'Scheduled', lastMaintenance: '2026-05-20', nextMaintenance: '2026-08-20' },
  { id: 'MCH-005', name: 'Air Comp Epsilon', type: 'Air Compressor', department: 'Utilities', status: 'Online', serialNo: 'SN-AC-2021-005', installDate: '2021-06-12', lifetime: 12, warranty: '2026-06-12', location: 'Utility Room A', healthScore: 89, performanceScore: 91, maintenanceStatus: 'Good', lastMaintenance: '2026-06-20', nextMaintenance: '2026-09-20' },
  { id: 'MCH-006', name: 'Laser Cutter Zeta', type: 'Laser Cutter', department: 'Production Line B', status: 'Critical', serialNo: 'SN-LC-2020-006', installDate: '2020-09-08', lifetime: 15, warranty: '2025-09-08', location: 'Bay 5, Floor 1', healthScore: 45, performanceScore: 38, maintenanceStatus: 'Critical', lastMaintenance: '2026-03-01', nextMaintenance: '2026-06-01' },
  { id: 'MCH-007', name: 'Injection Molder Eta', type: 'Injection Molder', department: 'Production Line A', status: 'Online', serialNo: 'SN-IM-2022-007', installDate: '2022-04-18', lifetime: 20, warranty: '2027-04-18', location: 'Bay 6, Floor 2', healthScore: 85, performanceScore: 87, maintenanceStatus: 'Good', lastMaintenance: '2026-05-30', nextMaintenance: '2026-08-30' },
  { id: 'MCH-008', name: 'Furnace Theta', type: 'Heat Treatment Furnace', department: 'Production Line B', status: 'Maintenance', serialNo: 'SN-HF-2019-008', installDate: '2019-02-28', lifetime: 20, warranty: '2024-02-28', location: 'Bay 7, Floor 1', healthScore: 55, performanceScore: 60, maintenanceStatus: 'Under Maintenance', lastMaintenance: '2026-07-01', nextMaintenance: '2026-07-15' },
  { id: 'MCH-009', name: 'Packaging Iota', type: 'Packaging Machine', department: 'Packaging', status: 'Online', serialNo: 'SN-PM-2023-009', installDate: '2023-01-25', lifetime: 10, warranty: '2028-01-25', location: 'Packaging Hall', healthScore: 98, performanceScore: 96, maintenanceStatus: 'Excellent', lastMaintenance: '2026-07-01', nextMaintenance: '2026-10-01' },
  { id: 'MCH-010', name: 'Assembly Kappa', type: 'Assembly Station', department: 'Assembly', status: 'Online', serialNo: 'SN-AS-2021-010', installDate: '2021-08-14', lifetime: 15, warranty: '2026-08-14', location: 'Assembly Floor', healthScore: 82, performanceScore: 80, maintenanceStatus: 'Good', lastMaintenance: '2026-06-10', nextMaintenance: '2026-09-10' },
  { id: 'MCH-011', name: 'Quality Scanner Lambda', type: 'Quality Scanner', department: 'Quality Control', status: 'Online', serialNo: 'SN-QS-2022-011', installDate: '2022-11-03', lifetime: 8, warranty: '2027-11-03', location: 'QC Lab', healthScore: 94, performanceScore: 97, maintenanceStatus: 'Good', lastMaintenance: '2026-06-25', nextMaintenance: '2026-09-25' },
  { id: 'MCH-012', name: 'Pump Station Mu', type: 'Industrial Pump', department: 'Utilities', status: 'Warning', serialNo: 'SN-IP-2020-012', installDate: '2020-12-01', lifetime: 10, warranty: '2025-12-01', location: 'Utility Room B', healthScore: 62, performanceScore: 68, maintenanceStatus: 'Due Soon', lastMaintenance: '2026-04-20', nextMaintenance: '2026-07-20' }
];

// Telemetry limits per machine type
const telemetryConfig = {
  'CNC Milling Machine':       { temp: [45, 85], vib: [0.5, 3.5], volt: [380, 420], curr: [15, 40], power: [5, 15] },
  'Hydraulic Press':           { temp: [40, 90], vib: [1.0, 5.0], volt: [380, 420], curr: [20, 60], power: [8, 22] },
  'Industrial Robot Arm':      { temp: [35, 75], vib: [0.2, 2.0], volt: [220, 240], curr: [5, 20], power: [2, 8] },
  'Conveyor System':           { temp: [30, 65], vib: [0.3, 2.5], volt: [380, 420], curr: [8, 25], power: [3, 10] },
  'Air Compressor':            { temp: [50, 95], vib: [1.5, 6.0], volt: [380, 420], curr: [25, 70], power: [10, 30] },
  'Industrial Pump':           { temp: [40, 80], vib: [0.8, 4.0], volt: [380, 420], curr: [15, 45], power: [6, 18] },
  'Laser Cutter':              { temp: [55, 100], vib: [0.1, 1.5], volt: [220, 240], curr: [10, 30], power: [4, 12] },
  'Injection Molder':          { temp: [60, 110], vib: [0.5, 3.0], volt: [380, 420], curr: [20, 55], power: [8, 20] },
  'Heat Treatment Furnace':    { temp: [200, 900], vib: [0.1, 1.0], volt: [380, 420], curr: [30, 80], power: [12, 40] },
  'Packaging Machine':         { temp: [30, 60], vib: [0.3, 2.0], volt: [220, 240], curr: [5, 15], power: [1, 5] },
  'Assembly Station':          { temp: [25, 55], vib: [0.2, 1.5], volt: [220, 240], curr: [3, 10], power: [1, 3] },
  'Quality Scanner':           { temp: [20, 45], vib: [0.05, 0.5], volt: [220, 240], curr: [2, 8], power: [0.5, 2] }
};

const rand = (min, max, decimals = 1) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

export function generateTelemetry(machine) {
  const cfg = telemetryConfig[machine.type] || telemetryConfig['CNC Milling Machine'];
  const isCritical = machine.status === 'Critical';
  const isWarning = machine.status === 'Warning';
  const multiplier = isCritical ? 1.25 : isWarning ? 1.1 : 1.0;
  return {
    temperature: rand(cfg.temp[0], cfg.temp[1] * multiplier),
    vibration: rand(cfg.vib[0], cfg.vib[1] * multiplier, 2),
    voltage: rand(cfg.volt[0], cfg.volt[1]),
    current: rand(cfg.curr[0], cfg.curr[1] * multiplier),
    power: rand(cfg.power[0], cfg.power[1] * multiplier),
    runtime: rand(2000, 8760, 0),
    productionCount: rand(500, 5000, 0),
    timestamp: new Date().toISOString()
  };
}

export function generateTrend(points = 24, base = 70, variance = 20) {
  return Array.from({ length: points }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    value: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance * 2))
  }));
}

export function generateProductionData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    produced: rand(18000, 25000, 0),
    target: 22000,
    rejected: rand(200, 800, 0),
    efficiency: rand(82, 96, 1)
  }));
}

export function generateMaintenanceHistory() {
  const types = ['Preventive', 'Corrective', 'Predictive', 'Emergency'];
  const statuses = ['Completed', 'In Progress', 'Scheduled', 'Overdue'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const engineers = ['John Smith', 'Sarah Connor', 'Mike Torres', 'Emily Chen', 'Raj Patel'];
  return machines.slice(0, 8).map((m, i) => ({
    id: `WO-${String(1000 + i).padStart(4, '0')}`,
    machineId: m.id,
    machineName: m.name,
    type: types[i % 4],
    status: statuses[i % 4],
    priority: priorities[i % 4],
    assignedTo: engineers[i % 5],
    scheduledDate: new Date(Date.now() + (i - 3) * 86400000 * 3).toLocaleDateString(),
    description: `${types[i % 4]} maintenance for ${m.name}`,
    estimatedHours: rand(2, 8, 1),
    cost: rand(500, 5000, 0)
  }));
}

export function generateIncidents() {
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const descriptions = [
    'Abnormal temperature spike detected in cooling system',
    'Hydraulic pressure drop below threshold',
    'Vibration levels exceeding safety limits',
    'Power fluctuation causing intermittent shutdown',
    'Laser alignment drift detected',
    'Conveyor belt slippage reported',
    'Coolant leak detected at pump station',
    'Emergency stop triggered — operator safety check'
  ];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `INC-${String(2024001 + i)}`,
    machineId: machines[i].id,
    machineName: machines[i].name,
    severity: severities[i % 4],
    status: statuses[i % 4],
    description: descriptions[i],
    reportedBy: ['Operator A', 'Sensor Auto', 'Engineer B', 'Shift Lead'][i % 4],
    reportedAt: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString(),
    assignedTo: ['John Smith', 'Sarah Connor', 'Mike Torres'][i % 3],
    rootCause: i % 4 === 3 ? 'Worn bearing — scheduled replacement overdue' : null,
    resolution: i % 4 === 3 ? 'Bearing replaced, system recalibrated' : null
  }));
}

export function generateInventory() {
  const categories = ['Bearings', 'Seals & Gaskets', 'Hydraulic Parts', 'Electrical', 'Filters', 'Belts & Chains', 'Tools', 'Lubricants'];
  const items = [
    { name: 'Deep Groove Ball Bearing 6205', category: 'Bearings', sku: 'BRG-6205', qty: 48, min: 20, max: 100, reorder: 30, unitCost: 12.50, supplier: 'SKF Industrial' },
    { name: 'Hydraulic Seal Kit Type A', category: 'Seals & Gaskets', sku: 'HSK-001A', qty: 12, min: 10, max: 50, reorder: 15, unitCost: 45.00, supplier: 'Parker Hannifin' },
    { name: 'Hydraulic Pump P100', category: 'Hydraulic Parts', sku: 'HYP-P100', qty: 3, min: 2, max: 8, reorder: 3, unitCost: 890.00, supplier: 'Bosch Rexroth' },
    { name: '3-Phase Motor 15kW', category: 'Electrical', sku: 'MTR-15K', qty: 2, min: 1, max: 5, reorder: 2, unitCost: 1250.00, supplier: 'ABB Motors' },
    { name: 'Industrial Air Filter F200', category: 'Filters', sku: 'FLT-F200', qty: 35, min: 15, max: 60, reorder: 20, unitCost: 18.00, supplier: 'Donaldson Co.' },
    { name: 'V-Belt B-Section 1500', category: 'Belts & Chains', sku: 'VBT-B1500', qty: 22, min: 10, max: 40, reorder: 15, unitCost: 8.75, supplier: 'Gates Belts' },
    { name: 'Gear Oil ISO VG 220', category: 'Lubricants', sku: 'OIL-VG220', qty: 8, min: 5, max: 20, reorder: 8, unitCost: 65.00, supplier: 'Shell Lubricants' },
    { name: 'PLC Module Siemens S7-300', category: 'Electrical', sku: 'PLC-S7300', qty: 4, min: 2, max: 8, reorder: 3, unitCost: 2100.00, supplier: 'Siemens AG' },
    { name: 'Coolant Pump CP-50', category: 'Hydraulic Parts', sku: 'CPM-50', qty: 6, min: 3, max: 12, reorder: 4, unitCost: 320.00, supplier: 'Grundfos' },
    { name: 'Proximity Sensor PNP 24V', category: 'Electrical', sku: 'SNS-PNP24', qty: 55, min: 20, max: 80, reorder: 30, unitCost: 22.00, supplier: 'IFM Electronic' },
    { name: 'Roller Chain #50 10ft', category: 'Belts & Chains', sku: 'RCH-50-10', qty: 15, min: 8, max: 30, reorder: 12, unitCost: 38.00, supplier: 'Renold Chains' },
    { name: 'O-Ring Set BUNA-N 100pc', category: 'Seals & Gaskets', sku: 'ORG-BUN100', qty: 28, min: 10, max: 50, reorder: 15, unitCost: 15.00, supplier: 'Freudenberg' }
  ];
  return items;
}

export function generateKPIs() {
  return {
    totalMachines: 12,
    onlineMachines: 8,
    offlineMachines: 1,
    warningMachines: 2,
    criticalMachines: 1,
    maintenanceDue: 3,
    productionEfficiency: 87.4,
    machineAvailability: 91.2,
    powerConsumption: 284.6,
    oee: 83.7,
    mtbf: 642,
    mttr: 4.2,
    activeAlerts: 7,
    openIncidents: 3,
    totalAssets: 48,
    inventoryValue: 182540,
    maintenanceCostMTD: 24800,
    productionCountToday: 14720
  };
}

export const aiInsights = [
  { id: 1, type: 'warning', machine: 'MCH-006', title: 'Laser Cutter Failure Risk High', message: 'Vibration trends indicate 78% failure probability within 72 hours. Schedule immediate inspection.', time: '2 min ago', icon: '⚠️' },
  { id: 2, type: 'info', machine: 'MCH-002', title: 'Hydraulic Press Maintenance Due', message: 'Maintenance window approaching. Last service was 87 days ago. Recommended interval: 90 days.', time: '15 min ago', icon: '🔧' },
  { id: 3, type: 'success', machine: 'MCH-009', title: 'Packaging Machine Optimal', message: 'Operating at 98% efficiency. All parameters within nominal range.', time: '1 hr ago', icon: '✅' },
  { id: 4, type: 'critical', machine: 'MCH-008', title: 'Furnace Maintenance In Progress', message: 'Scheduled maintenance currently underway. ETA completion: 14:30 today.', time: '3 hrs ago', icon: '🔥' },
  { id: 5, type: 'info', machine: 'MCH-012', title: 'Pump Station Bearing Wear', message: 'Acoustic analysis suggests early-stage bearing wear. Monitor vibration over next 7 days.', time: '5 hrs ago', icon: '📊' }
];

export const recentActivities = [
  { id: 1, action: 'Work Order Created', detail: 'WO-1007 assigned to Sarah Connor for MCH-006', time: '3 min ago', type: 'maintenance' },
  { id: 2, action: 'Incident Reported', detail: 'INC-2024007 — Vibration anomaly on Pump Station Mu', time: '18 min ago', type: 'incident' },
  { id: 3, action: 'Machine Back Online', detail: 'MCH-011 Quality Scanner resumed normal operation', time: '45 min ago', type: 'machine' },
  { id: 4, action: 'Inventory Alert', detail: 'Hydraulic Pump P100 stock below reorder point', time: '1 hr ago', type: 'inventory' },
  { id: 5, action: 'Shift Started', detail: 'Night shift (23:00–07:00) operational — 6 operators on floor', time: '2 hrs ago', type: 'production' },
  { id: 6, action: 'AI Report Generated', detail: 'Monthly OEE analysis report ready for download', time: '3 hrs ago', type: 'ai' },
  { id: 7, action: 'Maintenance Completed', detail: 'WO-1001 — Preventive maintenance on MCH-001 completed', time: '4 hrs ago', type: 'maintenance' }
];

export const aiConversationHistory = [
  { role: 'assistant', content: 'Hello! I\'m your AI-Ops Industrial Assistant. I have access to all machine data, maintenance records, and engineering documents. How can I help you today?', time: '09:00' },
  { role: 'user', content: 'What is the current health status of the Laser Cutter?', time: '09:02' },
  { role: 'assistant', content: 'The Laser Cutter (MCH-006 — Laser Cutter Zeta) is currently in **CRITICAL** status. Here\'s the summary:\n\n• **Health Score:** 45/100\n• **Performance Score:** 38/100\n• **Last Maintenance:** March 1, 2026 (127 days ago)\n• **Status:** Overdue for maintenance by 27 days\n\n**AI Analysis:** Vibration levels show a consistent upward trend over the past 14 days. Thermal imaging anomalies detected in the optical path. I recommend **immediate shutdown and inspection** to prevent catastrophic failure.\n\n**Action Recommended:** Create a Critical Work Order and assign to a senior technician today.', time: '09:02' },
  { role: 'user', content: 'Generate a maintenance recommendation for all warning machines', time: '09:05' },
  { role: 'assistant', content: '**Maintenance Recommendations — Warning Machines**\n\n**1. MCH-002 — Hydraulic Press Beta**\n• Schedule: Within 3 days\n• Action: Replace hydraulic seals, check pressure relief valve, flush hydraulic fluid\n• Estimated Duration: 6 hours\n• Required Parts: HSK-001A (Seal Kit), HYP-P100 (Pump)\n\n**2. MCH-012 — Pump Station Mu**\n• Schedule: Within 7 days\n• Action: Bearing inspection and replacement, shaft alignment check\n• Estimated Duration: 4 hours\n• Required Parts: BRG-6205 (x4 bearings), CPM-50 (backup pump)\n\n**Total Estimated Cost:** $4,200–$6,800\n**Risk of Deferral:** High — failure probability increases 15% per week of delay', time: '09:05' }
];
