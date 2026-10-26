// ============================================================
// AI-Ops Simulation Service
// Provides machine data, robot state, and event streams
// Falls back to generated data when backend is unavailable
// Future-ready: MQTT / OPC-UA / ROS2 integration hooks
// ============================================================

import * as THREE from 'three';

export const FACTORY_MACHINES = [
  { id: 'MACHINE-001', name: 'Thermal Monitoring Unit', code: 'MCH-001', pos: [-14, 0, -10], type: 'cnc', status: 'ONLINE', dept: 'Production A', temp: 0, humidity: 0, health: 100, power: 0, efficiency: 100, runtime: 0, model: '/3D-Models/modural_robot_mecha_chimera_dyan_high-poly_mesh.glb', scale: 0.8, sensorSource: 'DHT22' },
  { id: 'MACHINE-002', name: 'Gas Monitoring Unit A',   code: 'MCH-002', pos: [-6,  0, -10], type: 'press', status: 'ONLINE', dept: 'Production B', raw: 0, voltage: 0, health: 100, power: 0, efficiency: 100, runtime: 0, model: '/3D-Models/excavator_hydraulic_shear_attachment_ii.glb', scale: 0.5, sensorSource: 'MQ-2' },
  { id: 'MACHINE-003', name: 'Gas Monitoring Unit B',   code: 'MCH-003', pos: [4,   0, -10], type: 'robotarm', status: 'ONLINE', dept: 'Assembly', raw: 0, voltage: 0, health: 100, power: 0, efficiency: 100, runtime: 0, model: '/3D-Models/biped_robot.glb', scale: 1.5, sensorSource: 'MQ-9' },
];

export const STATUS_COLORS = {
  ONLINE:      { hex: '#00aaff', emissive: new THREE.Color('#00aaff'), intensity: 0.9 },
  WARNING:     { hex: '#ff8800', emissive: new THREE.Color('#ff8800'), intensity: 1.2 },
  CRITICAL:    { hex: '#ff2222', emissive: new THREE.Color('#ff2222'), intensity: 1.8 },
  MAINTENANCE: { hex: '#9b59b6', emissive: new THREE.Color('#9b59b6'), intensity: 0.6 },
  OFFLINE:     { hex: '#444444', emissive: new THREE.Color('#111111'), intensity: 0.0 },
};

export const ROBOT_WAYPOINTS = [
  { pos: [-18, 0.45, 10],  name: 'Charging Dock',      action: 'charging',   dwell: 6 },
  { pos: [-14, 0.45, -10], name: 'CNC Mill Alpha',      action: 'inspecting', dwell: 4 },
  { pos: [-6,  0.45, -10], name: 'Hydraulic Press',     action: 'inspecting', dwell: 3 },
  { pos: [4,   0.45, -10], name: 'Robot Arm Gamma',     action: 'inspecting', dwell: 3 },
  { pos: [14,  0.45, -10], name: 'Laser Cutter Zeta',   action: 'inspecting', dwell: 5 },
  { pos: [14,  0.45,  4],  name: 'Pump Station Mu',     action: 'inspecting', dwell: 3 },
  { pos: [4,   0.45,  4],  name: 'Packaging Station',   action: 'inspecting', dwell: 2 },
  { pos: [-6,  0.45,  4],  name: 'Furnace Area',        action: 'inspecting', dwell: 3 },
  { pos: [-14, 0.45,  4],  name: 'Injection Molder',    action: 'inspecting', dwell: 3 },
];

export const AI_INSIGHTS = [
  { id: 1, type: 'critical', icon: '🔴', text: 'Laser Cutter Zeta — vibration 340% above limit. Immediate inspection required.', time: 'now' },
  { id: 2, type: 'warning',  icon: '⚠️', text: 'Hydraulic Press Beta — bearing wear probability 68%. Schedule maintenance in 3 days.', time: '2m ago' },
  { id: 3, type: 'info',     icon: '🤖', text: 'Inspection Robot completed patrol route. 9 checkpoints verified.', time: '5m ago' },
  { id: 4, type: 'info',     icon: '📊', text: 'OEE this shift: 83.7%. Target 86%. Bottleneck: Laser Cutter (offline 22 min).', time: '8m ago' },
  { id: 5, type: 'ok',       icon: '✅', text: 'CNC Mill Alpha — all parameters nominal. Next maintenance in 14 days.', time: '10m ago' },
  { id: 6, type: 'warning',  icon: '📦', text: 'Hydraulic Pump P100 stock at reorder point (3 units). Purchase order required.', time: '12m ago' },
  { id: 7, type: 'info',     icon: '🌡️', text: 'Furnace Theta maintenance in progress. ETA: 2h 15m remaining.', time: '15m ago' },
  { id: 8, type: 'ok',       icon: '💓', text: 'Fleet health score: 77.8% (8 online, 2 warning, 1 critical, 1 maintenance).', time: '18m ago' },
];

export const INITIAL_TIMELINE = [
  { id: 1, time: '18:44', type: 'critical', text: 'ALERT: Laser Cutter Zeta vibration threshold exceeded' },
  { id: 2, time: '18:41', type: 'robot',    text: 'Robot completed full patrol — 9 machines inspected' },
  { id: 3, time: '18:36', type: 'info',     text: 'Robot inspecting Injection Molder Eta' },
  { id: 4, time: '18:32', type: 'info',     text: 'Robot inspecting Furnace Theta area' },
  { id: 5, time: '18:28', type: 'warning',  text: 'Pump Station Mu — elevated vibration detected' },
  { id: 6, time: '18:24', type: 'info',     text: 'Robot inspecting Packaging Station' },
  { id: 7, time: '18:20', type: 'ok',       text: 'Work Order WO-1001 completed — CNC Mill PM done' },
  { id: 8, time: '18:15', type: 'robot',    text: 'Robot charged (100%). Starting patrol mission' },
];

export const CAMERA_PRESETS = {
  overview:    { position: [0, 28, 32], target: [0, 0, 0], label: 'Overview' },
  operator:    { position: [-5, 8, 22], target: [0, 0, -5], label: 'Operator View' },
  production:  { position: [-10, 10, 0], target: [-10, 0, -5], label: 'Production Line' },
  inspection:  { position: [14, 8, -8],  target: [14, 0, -10], label: 'Inspection Area' },
  warehouse:   { position: [18, 10, 0],  target: [18, 0, 0], label: 'Warehouse' },
  birdseye:    { position: [0, 40, 0.1], target: [0, 0, 0], label: "Bird's Eye" },
  robot:       { position: null, target: null, label: 'Follow Robot' },
};

// Fluctuate telemetry data
export function fluctuate(machines) {
  return machines.map(m => ({
    ...m,
    temp: Math.max(30, m.temp + (Math.random() - 0.5) * 2),
    power: m.status === 'MAINTENANCE' ? 0 : Math.max(0, m.power + (Math.random() - 0.5) * 0.5),
    efficiency: m.status === 'MAINTENANCE' ? 0 : Math.min(100, Math.max(0, m.efficiency + (Math.random() - 0.5) * 1)),
    runtime: m.status === 'ONLINE' || m.status === 'WARNING' || m.status === 'CRITICAL' ? m.runtime + 1 : m.runtime,
  }));
}

// Generate a new timeline event based on robot action
export function generateRobotEvent(waypointName, action, prevEvents) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const msgs = {
    inspecting: `Robot arrived at ${waypointName} — inspection started`,
    charging:   `Robot returned to charging dock — battery 100%`,
    idle:       `Robot idle at ${waypointName}`,
  };
  const newEvent = { id: Date.now(), time: timeStr, type: 'robot', text: msgs[action] || `Robot at ${waypointName}` };
  return [newEvent, ...prevEvents].slice(0, 30);
}
