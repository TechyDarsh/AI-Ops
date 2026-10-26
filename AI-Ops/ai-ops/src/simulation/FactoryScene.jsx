// ============================================================
// AI-Ops Factory 3D Scene
// Full Three.js / React Three Fiber industrial simulation
// ============================================================

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Grid, Environment, Text, Sparkles, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FACTORY_MACHINES, STATUS_COLORS, ROBOT_WAYPOINTS, CAMERA_PRESETS } from './SimulationService';

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.OFFLINE;
}

const MACHINE_BODY_COLOR = '#0e1e30';
const FLOOR_COLOR = '#090e18';

// ── Scene Lighting ────────────────────────────────────────────────────────────
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.3} color="#b0c8e0" />
      <directionalLight position={[20, 30, 10]} intensity={0.6} color="#e0e8ff" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-far={100} shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30} />
      <directionalLight position={[-15, 20, -10]} intensity={0.3} color="#8ab0cc" />
      {/* Colored point lights for atmosphere */}
      <pointLight position={[-14, 6, -10]} intensity={1.5} color="#004488" distance={12} />
      <pointLight position={[14, 6, -10]}  intensity={3.0} color="#440000" distance={15} />
      <pointLight position={[-18, 4, 10]}  intensity={1.0} color="#00aa44" distance={10} />
      <pointLight position={[0, 8, -3]}    intensity={0.8} color="#003366" distance={20} />
    </>
  );
}

// ── Factory Floor ─────────────────────────────────────────────────────────────
function FactoryFloor() {
  return (
    <>
      {/* High-end cinematic reflective base */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[70, 55]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={0.2}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#03060c"
          metalness={0.7}
        />
      </mesh>

      {/* Grid overlay */}
      <Grid
        position={[0, 0.01, 0]}
        args={[70, 55]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#0a1a2a"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#0e2a44"
        fadeDistance={80}
        fadeStrength={1.5}
        infiniteGrid={false}
      />

      {/* Yellow safety walkway strips */}
      <SafetyMarkings />

      {/* Wall backsplash hints */}
      <mesh position={[0, 3, -24]} receiveShadow>
        <boxGeometry args={[70, 6, 0.3]} />
        <meshStandardMaterial color="#080e16" roughness={0.9} />
      </mesh>
      <mesh position={[-33, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 55]} />
        <meshStandardMaterial color="#080e16" roughness={0.9} />
      </mesh>
      <mesh position={[33, 3, 0]} receiveShadow>
        <boxGeometry args={[0.3, 6, 55]} />
        <meshStandardMaterial color="#080e16" roughness={0.9} />
      </mesh>
    </>
  );
}

function SafetyMarkings() {
  const yellow = '#ffcc00';
  return (
    <group position={[0, 0.02, 0]}>
      {/* Main central walkway (N-S) */}
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0, 0]}>
          <planeGeometry args={[0.12, 50]} />
          <meshStandardMaterial color={yellow} emissive={yellow} emissiveIntensity={0.15} roughness={1} />
        </mesh>
      ))}
      {/* E-W walkway */}
      {[-0.25, 0.25].map((z, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0, z]}>
          <planeGeometry args={[60, 0.12]} />
          <meshStandardMaterial color={yellow} emissive={yellow} emissiveIntensity={0.15} roughness={1} />
        </mesh>
      ))}
      {/* Machine zone hatching (around critical machine) */}
      <mesh rotation-x={-Math.PI / 2} position={[14, 0, -10]}>
        <ringGeometry args={[2.2, 2.5, 32]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={0.3} roughness={1} />
      </mesh>
    </group>
  );
}

// ── Status Indicator Light ────────────────────────────────────────────────────
function StatusLight({ status, position = [0, 0, 0] }) {
  const meshRef = useRef();
  const sc = statusColor(status);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const blink = status === 'CRITICAL' ? Math.abs(Math.sin(t * 4)) :
                  status === 'WARNING'  ? 0.5 + Math.abs(Math.sin(t * 1.5)) * 0.5 : 1;
    meshRef.current.material.emissiveIntensity = sc.intensity * blink;
  });
  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshStandardMaterial color={sc.hex} emissive={sc.hex} emissiveIntensity={sc.intensity} toneMapped={false} />
    </mesh>
  );
}

// ── Machine Label HUD (HTML in 3D) ────────────────────────────────────────────
function MachineLabel({ machine, visible }) {
  if (!visible) return null;
  const sc = statusColor(machine.status);
  return (
    <Html
      position={[0, 3.2, 0]}
      center
      distanceFactor={14}
      occlude={false}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        background: 'rgba(4, 10, 22, 0.92)',
        border: `1px solid ${sc.hex}44`,
        borderLeft: `2px solid ${sc.hex}`,
        borderRadius: 3,
        padding: '5px 9px',
        minWidth: 150,
        fontFamily: '"Roboto Mono", monospace',
        fontSize: 10,
        color: '#90aacc',
        boxShadow: `0 0 12px ${sc.hex}22`,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.hex, display: 'inline-block', boxShadow: `0 0 4px ${sc.hex}` }}></span>
          <span style={{ color: sc.hex, fontWeight: 700, fontSize: 9, letterSpacing: 1 }}>{machine.status}</span>
        </div>
        <div style={{ color: '#cce0ff', fontWeight: 600, fontSize: 10.5, marginBottom: 4 }}>{machine.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontSize: 9.5 }}>
          {machine.sensorSource === 'DHT22' ? (
            <>
              <span>🌡 {(machine.temp || 0).toFixed(1)}°C</span>
              <span>💧 {(machine.humidity || 0).toFixed(1)}%</span>
            </>
          ) : (
            <>
              <span>💨 {(machine.raw || 0).toFixed(0)} raw</span>
              <span>⚡ {(machine.voltage || 0).toFixed(2)}V</span>
            </>
          )}
          <span>❤ {(machine.health || 0).toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

// ── CNC Mill Machine ──────────────────────────────────────────────────────────
function MachineCNC({ machine, onClick, selected, showLabels }) {
  const spindleRef = useRef();
  const sc = statusColor(machine.status);
  useFrame((_, delta) => {
    if (spindleRef.current && machine.status === 'ONLINE')
      spindleRef.current.rotation.y += delta * 10;
  });
  return (
    <group position={machine.pos} onClick={onClick}>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#0a1520" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[2.8, 2.2, 2.8]} />
        <meshStandardMaterial color={MACHINE_BODY_COLOR} metalness={0.7} roughness={0.25} emissive={sc.emissive} emissiveIntensity={0.06} />
      </mesh>
      {/* Control panel face */}
      <mesh position={[0, 1.0, 1.41]} castShadow>
        <boxGeometry args={[2.4, 1.2, 0.05]} />
        <meshStandardMaterial color="#0e2440" metalness={0.6} roughness={0.4} emissive="#001133" emissiveIntensity={0.5} />
      </mesh>
      {/* Spindle head */}
      <group ref={spindleRef} position={[0, 2.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.35, 0.8, 16]} />
          <meshStandardMaterial color="#1a3a5a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Spindle tip */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#4a7aaa" metalness={0.95} roughness={0.05} emissive={sc.emissive} emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* Status light cluster */}
      <StatusLight status={machine.status} position={[1.1, 2.8, 1.1]} />
      <StatusLight status={machine.status} position={[-1.1, 2.8, 1.1]} />
      {/* Selection ring */}
      {selected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
      <MachineLabel machine={machine} visible={showLabels} />
    </group>
  );
}

// ── Conveyor Belt ──────────────────────────────────────────────────────────────
function MachineConveyor({ machine, showLabels }) {
  const boxRefs = useRef([]);
  const beltOffset = useRef(0);
  const BELT_LEN = 20;
  const BOX_COUNT = 5;

  useFrame((_, delta) => {
    if (machine.status !== 'ONLINE') return;
    beltOffset.current = (beltOffset.current + delta * 1.2) % (BELT_LEN / BOX_COUNT);
    boxRefs.current.forEach((r, i) => {
      if (!r) return;
      const base = -BELT_LEN / 2 + 1 + i * (BELT_LEN / BOX_COUNT);
      r.position.x = base + beltOffset.current;
      if (r.position.x > BELT_LEN / 2 - 0.5) r.position.x -= BELT_LEN;
    });
  });

  return (
    <group position={machine.pos}>
      {/* Belt body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BELT_LEN, 0.35, 2.5]} />
        <meshStandardMaterial color="#0c1a28" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Belt surface */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[BELT_LEN, 0.05, 2.3]} />
        <meshStandardMaterial color="#0a2a0a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rollers at ends */}
      {[-BELT_LEN / 2, BELT_LEN / 2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.2, 0.2, 2.5, 16]} />
          <meshStandardMaterial color="#1a3a5a" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Moving boxes */}
      {Array.from({ length: BOX_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={el => boxRefs.current[i] = el}
          position={[-BELT_LEN / 2 + 1 + i * (BELT_LEN / BOX_COUNT), 0.35, 0]}
          castShadow
        >
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1a4a6a' : '#2a3a1a'} metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      {/* Status lights */}
      <StatusLight status={machine.status} position={[-BELT_LEN / 2 + 0.5, 0.6, 1.3]} />
      <StatusLight status={machine.status} position={[BELT_LEN / 2 - 0.5, 0.6, 1.3]} />
      <MachineLabel machine={machine} visible={showLabels} />
    </group>
  );
}

// ── Robot Arm ─────────────────────────────────────────────────────────────────
function MachineRobotArm({ machine, onClick, selected, showLabels }) {
  const base = useRef(), arm1 = useRef(), arm2 = useRef(), end = useRef();
  const sc = statusColor(machine.status);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (machine.status === 'ONLINE' || machine.status === 'WARNING') {
      if (base.current) base.current.rotation.y = Math.sin(t * 0.3) * 0.9;
      if (arm1.current) arm1.current.rotation.z = Math.sin(t * 0.4 + 0.5) * 0.5 - 0.3;
      if (arm2.current) arm2.current.rotation.z = Math.sin(t * 0.5 + 1.0) * 0.6 + 0.4;
      if (end.current) end.current.rotation.y = t * 2;
    }
  });
  return (
    <group position={machine.pos} onClick={onClick}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.0, 0.3, 16]} />
        <meshStandardMaterial color="#0a1520" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Rotating base */}
      <group ref={base} position={[0, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.7, 0.5, 12]} />
          <meshStandardMaterial color={MACHINE_BODY_COLOR} metalness={0.8} roughness={0.2} emissive={sc.emissive} emissiveIntensity={0.08} />
        </mesh>
        {/* Lower arm */}
        <group ref={arm1} position={[0, 0.4, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.25, 1.8, 0.25]} />
            <meshStandardMaterial color="#0e2840" metalness={0.85} roughness={0.15} />
          </mesh>
          {/* Upper arm */}
          <group ref={arm2} position={[0, 1.8, 0]}>
            <mesh position={[0, 0.7, 0.1]} castShadow>
              <boxGeometry args={[0.2, 1.5, 0.2]} />
              <meshStandardMaterial color="#0e2840" metalness={0.85} roughness={0.15} />
            </mesh>
            {/* End effector */}
            <group ref={end} position={[0, 1.5, 0.1]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
                <meshStandardMaterial color={sc.hex} emissive={sc.emissive} emissiveIntensity={0.5} metalness={0.9} roughness={0.1} toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      {selected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
      <MachineLabel machine={machine} visible={showLabels} />
    </group>
  );
}

// ── Generic Machine (Press / Furnace / Laser / Molder / Pump / Packaging) ────
function MachineGeneric({ machine, onClick, selected, showLabels }) {
  const indicatorRef = useRef();
  const partRef = useRef();
  const sc = statusColor(machine.status);

  const typeConfig = {
    press:     { w: 2.5, h: 3.0, d: 2.5 },
    furnace:   { w: 3.0, h: 2.5, d: 3.0 },
    laser:     { w: 2.5, h: 2.0, d: 2.5 },
    molder:    { w: 3.0, h: 2.2, d: 3.0 },
    pump:      { w: 2.0, h: 2.0, d: 2.0 },
    packaging: { w: 3.0, h: 1.8, d: 3.0 },
  };
  const cfg = typeConfig[machine.type] || { w: 2.5, h: 2.0, d: 2.5 };

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (indicatorRef.current) {
      const blink = machine.status === 'CRITICAL' ? Math.abs(Math.sin(t * 4)) :
                    machine.status === 'WARNING'  ? 0.6 + Math.abs(Math.sin(t * 1.5)) * 0.4 : 1;
      indicatorRef.current.material.emissiveIntensity = sc.intensity * blink;
    }
    if (partRef.current) {
      // Type-specific animation
      if (machine.type === 'press' && machine.status !== 'OFFLINE' && machine.status !== 'MAINTENANCE') {
        partRef.current.position.y = cfg.h / 2 + 0.2 + Math.abs(Math.sin(t * 0.8)) * 0.6;
      } else if (machine.type === 'pump' && machine.status !== 'OFFLINE' && machine.status !== 'MAINTENANCE') {
        partRef.current.rotation.y += delta * 4;
      } else if (machine.type === 'packaging' && machine.status === 'ONLINE') {
        partRef.current.rotation.z = Math.sin(t * 1.5) * 0.5;
      } else if (machine.type === 'laser' && machine.status === 'CRITICAL') {
        partRef.current.material.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 6)) * 1.5;
      }
    }
  });

  return (
    <group position={machine.pos} onClick={onClick}>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[cfg.w + 0.4, 0.2, cfg.d + 0.4]} />
        <meshStandardMaterial color="#0a1520" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, cfg.h / 2 + 0.2, 0]} castShadow>
        <boxGeometry args={[cfg.w, cfg.h, cfg.d]} />
        <meshStandardMaterial
          color={machine.type === 'furnace' ? '#1a0800' : MACHINE_BODY_COLOR}
          metalness={0.7} roughness={0.25}
          emissive={sc.emissive}
          emissiveIntensity={machine.type === 'furnace' && machine.status === 'MAINTENANCE' ? 0.3 : 0.05}
        />
      </mesh>

      {/* Type-specific moving part */}
      {machine.type === 'press' && (
        <mesh ref={partRef} position={[0, cfg.h + 0.2, 0]} castShadow>
          <boxGeometry args={[cfg.w - 0.4, 0.3, cfg.d - 0.4]} />
          <meshStandardMaterial color="#1a3a5a" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
      {machine.type === 'pump' && (
        <mesh ref={partRef} position={[0, cfg.h + 0.6, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.15, 8]} />
          <meshStandardMaterial color="#1a4a6a" metalness={0.9} roughness={0.1} emissive="#004488" emissiveIntensity={0.4} />
        </mesh>
      )}
      {machine.type === 'laser' && (
        <mesh ref={partRef} position={[0, cfg.h + 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={1.0} toneMapped={false} />
        </mesh>
      )}
      {machine.type === 'packaging' && (
        <group>
          <mesh ref={partRef} position={[0.8, cfg.h + 0.2, 0]} castShadow>
            <boxGeometry args={[0.15, 0.8, 0.15]} />
            <meshStandardMaterial color="#1a4a6a" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Furnace glow window */}
      {machine.type === 'furnace' && (
        <mesh position={[0, cfg.h / 2 + 0.2, cfg.d / 2 + 0.01]}>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.8} toneMapped={false} transparent opacity={0.85} />
        </mesh>
      )}

      {/* Status light */}
      <group ref={indicatorRef}>
        <StatusLight status={machine.status} position={[cfg.w / 2 - 0.1, cfg.h + 0.5, cfg.d / 2 - 0.1]} />
      </group>

      {/* Panel face */}
      <mesh position={[0, cfg.h / 2, cfg.d / 2 + 0.01]}>
        <planeGeometry args={[cfg.w * 0.7, cfg.h * 0.4]} />
        <meshStandardMaterial color="#0e2440" emissive="#001133" emissiveIntensity={0.3} />
      </mesh>

      {selected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[cfg.w * 0.7, cfg.w * 0.8, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
      <MachineLabel machine={machine} visible={showLabels} />
    </group>
  );
}

// ── Storage Racks ─────────────────────────────────────────────────────────────
function StorageRacks() {
  return (
    <>
      {[[-3, 3, 9], [3, 9, 9]].map(([za, zb, x], i) => (
        <group key={i} position={[x, 0, (za + zb) / 2]}>
          {[0, 1.2, 2.4].map(y => (
            <mesh key={y} position={[0, y + 0.3, 0]} castShadow>
              <boxGeometry args={[2, 0.08, (zb - za + 2)]} />
              <meshStandardMaterial color="#0e2440" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* Vertical poles */}
          {[[-0.9, -2.2], [-0.9, 2.2], [0.9, -2.2], [0.9, 2.2]].map(([px, pz], j) => (
            <mesh key={j} position={[px, 1.5, pz]} castShadow>
              <boxGeometry args={[0.06, 3, 0.06]} />
              <meshStandardMaterial color="#1a3a5a" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Boxes on shelves */}
          {[0, 1.2].map(sy => [0, -0.7, 0.7].map((sz, k) => (
            <mesh key={`${sy}-${k}`} position={[0, sy + 0.38, sz]} castShadow>
              <boxGeometry args={[0.55, 0.35, 0.55]} />
              <meshStandardMaterial color={['#1a2a4a', '#2a1a1a', '#1a3a1a'][k % 3]} metalness={0.3} roughness={0.7} />
            </mesh>
          )))}
        </group>
      ))}
    </>
  );
}

// ── Control Room ──────────────────────────────────────────────────────────────
function ControlRoom() {
  return (
    <group position={[20, 0, -12]}>
      {/* Floor */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 7]} />
        <meshStandardMaterial color="#0a1828" roughness={0.8} />
      </mesh>
      {/* Glass walls */}
      {[{ pos: [0, 2, -3.5], size: [8, 4, 0.08] }, { pos: [0, 2, 3.5], size: [8, 4, 0.08] },
        { pos: [-4, 2, 0],  size: [0.08, 4, 7] }, { pos: [4, 2, 0],  size: [0.08, 4, 7] }].map((w, i) => (
        <mesh key={i} position={w.pos} castShadow>
          <boxGeometry args={w.size} />
          <meshStandardMaterial color="#003366" transparent opacity={0.25} metalness={0.1} roughness={0.0} envMapIntensity={0.5} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[8, 0.08, 7]} />
        <meshStandardMaterial color="#0a1828" roughness={0.8} />
      </mesh>
      {/* Monitor wall */}
      <mesh position={[-3.5, 2.5, 0]}>
        <boxGeometry args={[0.1, 2.5, 5]} />
        <meshStandardMaterial color="#0e2440" emissive="#001844" emissiveIntensity={0.6} />
      </mesh>
      {/* Screens */}
      {[[-0.8, -1.6], [-0.8, 0], [-0.8, 1.6]].map(([y, z], i) => (
        <mesh key={i} position={[-3.4, 2.5 + y * 0.3, z]}>
          <planeGeometry args={[1.3, 0.8]} />
          <meshStandardMaterial color="#001833" emissive="#002266" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}
      {/* Control desk */}
      <mesh position={[-2, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 0.9, 4]} />
        <meshStandardMaterial color="#0a1828" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Point light inside */}
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#0066ff" distance={8} />
    </group>
  );
}

// ── Charging Dock ─────────────────────────────────────────────────────────────
function ChargingDock() {
  const glowRef = useRef();
  useFrame(({ clock }) => {
    if (glowRef.current) glowRef.current.material.emissiveIntensity = 0.4 + Math.abs(Math.sin(clock.elapsedTime * 0.8)) * 0.3;
  });
  return (
    <group position={[-18, 0, 10]}>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshStandardMaterial color="#001a00" roughness={0.9} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.0, 1.4, 32]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={0.5} toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color="#002200" emissive="#00aa22" emissiveIntensity={0.2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1, 0]} intensity={0.8} color="#00ff44" distance={5} />
      {/* Label */}
      <Html position={[0, 1.5, 0]} center distanceFactor={14}>
        <div style={{ fontFamily: 'Roboto Mono,monospace', fontSize: 10, color: '#44ff88', background: 'rgba(0,10,0,0.8)', padding: '3px 8px', borderRadius: 2, border: '1px solid #00aa22', whiteSpace: 'nowrap' }}>
          ⚡ CHARGING DOCK
        </div>
      </Html>
    </group>
  );
}

// ── Mobile Robot (AMR) ────────────────────────────────────────────────────────
export function MobileRobot({ onRobotClick, onStateChange }) {
  const groupRef = useRef();
  const lidarRef = useRef();
  const led1Ref = useRef(), led2Ref = useRef();
  const camConeRef = useRef();
  const trailRef = useRef([]);

  const state = useRef({
    waypointIndex: 0,
    phase: 'moving',
    dwellTimer: 0,
    position: new THREE.Vector3(-18, 0.45, 10),
    heading: 0,
    speed: 0,
    missionStart: Date.now(),
  });

  const target = useRef(new THREE.Vector3(...ROBOT_WAYPOINTS[0].pos));

  useEffect(() => {
    onStateChange && onStateChange({ ...ROBOT_WAYPOINTS[0], waypointIndex: 0, phase: 'charging', battery: 100, speed: 0 });
  }, []);

  useFrame(({ clock }, delta) => {
    const s = state.current;
    const group = groupRef.current;
    if (!group) return;

    // Lidar spin
    if (lidarRef.current) lidarRef.current.rotation.y += delta * 4;

    // LED blink
    const t = clock.elapsedTime;
    const ledBlink = Math.abs(Math.sin(t * 3));
    if (led1Ref.current) led1Ref.current.material.emissiveIntensity = ledBlink;
    if (led2Ref.current) led2Ref.current.material.emissiveIntensity = 1 - ledBlink;

    if (s.phase === 'moving') {
      const dir = target.current.clone().sub(s.position);
      const dist = dir.length();
      const SPEED = 4.5;

      if (dist < 0.15) {
        // Arrived at waypoint
        const wp = ROBOT_WAYPOINTS[s.waypointIndex];
        s.phase = 'inspecting';
        s.dwellTimer = wp.dwell;
        s.speed = 0;
        onStateChange && onStateChange({
          ...wp,
          waypointIndex: s.waypointIndex,
          phase: wp.action,
          battery: Math.max(20, 100 - s.waypointIndex * 8),
          speed: 0,
        });
      } else {
        const moveAmount = Math.min(SPEED * delta, dist);
        const dirNorm = dir.normalize();
        s.position.addScaledVector(dirNorm, moveAmount);
        s.heading = Math.atan2(dirNorm.x, dirNorm.z);
        s.speed = SPEED;
      }
    } else if (s.phase === 'inspecting') {
      s.dwellTimer -= delta;
      if (s.dwellTimer <= 0) {
        s.phase = 'moving';
        s.waypointIndex = (s.waypointIndex + 1) % ROBOT_WAYPOINTS.length;
        target.current = new THREE.Vector3(...ROBOT_WAYPOINTS[s.waypointIndex].pos);
        onStateChange && onStateChange({
          ...ROBOT_WAYPOINTS[s.waypointIndex],
          waypointIndex: s.waypointIndex,
          phase: 'moving',
          battery: Math.max(20, 100 - s.waypointIndex * 8),
          speed: 4.5,
        });
      }
    }

    // Apply position + heading
    group.position.lerp(s.position, 0.15);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, s.heading, 0.1);
  });

  return (
    <group ref={groupRef} position={[-18, 0.45, 10]} onClick={onRobotClick} renderOrder={10}>
      {/* Main body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.9, 0.55, 1.4]} />
        <meshStandardMaterial color="#0a1e30" metalness={0.8} roughness={0.2} emissive="#001133" emissiveIntensity={0.3} />
      </mesh>
      {/* Top panel */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[0.85, 0.06, 1.3]} />
        <meshStandardMaterial color="#0e2840" metalness={0.9} roughness={0.1} emissive="#001844" emissiveIntensity={0.4} />
      </mesh>

      {/* Wheels — 4 corners */}
      {[[-0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, -0.5], [0.5, 0, 0.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + 0.15, z]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.12, 16]} />
          <meshStandardMaterial color="#050a10" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}
      {/* Wheel hubs */}
      {[[-0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, -0.5], [0.5, 0, 0.5]].map(([x, y, z], i) => (
        <mesh key={i} position={[x + (x > 0 ? 0.07 : -0.07), y + 0.15, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 8]} />
          <meshStandardMaterial color="#1a4a8a" metalness={0.95} roughness={0.1} emissive="#0033aa" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      ))}

      {/* Lidar sensor (rotating) */}
      <group ref={lidarRef} position={[0, 0.82, 0]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.12, 16]} />
          <meshStandardMaterial color="#00ccff" emissive="#00aaff" emissiveIntensity={0.8} metalness={0.7} roughness={0.1} toneMapped={false} />
        </mesh>
        {/* Lidar scan beam hint */}
        <mesh position={[0.16, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.005, 0.005, 0.12, 4]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      {/* Camera module (front) */}
      <mesh position={[0, 0.48, -0.72]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.08]} />
        <meshStandardMaterial color="#051020" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Camera lens */}
      <mesh position={[0, 0.48, -0.77]}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#00aaff" emissive="#0066ff" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      {/* LED status lights */}
      <mesh ref={led1Ref} position={[-0.2, 0.72, -0.6]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <mesh ref={led2Ref} position={[0.2, 0.72, -0.6]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Point light (robot ambient) */}
      <pointLight position={[0, 0.5, 0]} intensity={0.4} color="#0066ff" distance={3} />

      {/* Robot HUD label */}
      <Html position={[0, 1.6, 0]} center distanceFactor={12}>
        <div style={{ fontFamily: 'Roboto Mono,monospace', fontSize: 10, color: '#00ffaa', background: 'rgba(0,8,20,0.9)', padding: '4px 9px', borderRadius: 3, border: '1px solid #00aaff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          🤖 AMR-01 · ACTIVE
        </div>
      </Html>
    </group>
  );
}

// ── Camera Controller ─────────────────────────────────────────────────────────
function CameraController({ preset }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (!preset || preset === 'robot') return;
    const p = CAMERA_PRESETS[preset];
    if (!p || !p.position) return;
    camera.position.set(...p.position);
    if (controlsRef.current) controlsRef.current.target.set(...p.target);
  }, [preset]);

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={70} makeDefault />;
}

// ── Robot Path Visualizer ─────────────────────────────────────────────────────
function RobotPath() {
  const points = ROBOT_WAYPOINTS.map(wp => new THREE.Vector3(...wp.pos));
  points.push(points[0]); // close loop
  const curve = new THREE.CatmullRomCurve3(points);
  const tubePoints = curve.getPoints(120);

  return (
    <>
      {tubePoints.map((pt, i) => i % 6 === 0 && (
        <mesh key={i} position={[pt.x, 0.04, pt.z]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.06, 6]} />
          <meshStandardMaterial color="#0044aa" emissive="#0044aa" emissiveIntensity={0.6} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

// ── GLTF Machine Loader ────────────────────────────────────────────────────────
import { useGLTF, Float } from '@react-three/drei';
import { Suspense } from 'react';

function MachineGLTF({ machine, onClick, selected, showLabels }) {
  const handleClick = useCallback((e) => { e.stopPropagation(); onClick(machine); }, [machine, onClick]);
  const { scene } = useGLTF(machine.model);
  const sc = statusColor(machine.status);

  // Clone scene so we can use it multiple times if needed, though they are unique here
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={machine.pos} onClick={handleClick}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <primitive object={clonedScene} scale={machine.scale || 1} position={[0, 0.5, 0]} />
      </Float>
      {/* Selection ring */}
      {selected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      )}
      <StatusLight status={machine.status} position={[0, 3.5, 0]} />
      <MachineLabel machine={machine} visible={showLabels} />
    </group>
  );
}

// ── Machine Dispatcher ────────────────────────────────────────────────────────
function MachineNode({ machine, onClick, selected, showLabels }) {
  const handleClick = useCallback((e) => { e.stopPropagation(); onClick(machine); }, [machine, onClick]);
  if (machine.model) {
    return (
      <Suspense fallback={<MachineGeneric {...{ machine, onClick: handleClick, selected, showLabels }} />}>
        <MachineGLTF {...{ machine, onClick: handleClick, selected, showLabels }} />
      </Suspense>
    );
  }
  if (machine.type === 'cnc')      return <MachineCNC {...{ machine, onClick: handleClick, selected, showLabels }} />;
  if (machine.type === 'conveyor') return <MachineConveyor {...{ machine, showLabels }} />;
  if (machine.type === 'robotarm') return <MachineRobotArm {...{ machine, onClick: handleClick, selected, showLabels }} />;
  return <MachineGeneric {...{ machine, onClick: handleClick, selected, showLabels }} />;
}

// ── Ambient Particles ─────────────────────────────────────────────────────────
function AtmosphericParticles() {
  return (
    <Sparkles
      count={60}
      scale={[50, 10, 40]}
      position={[0, 5, 0]}
      size={0.5}
      speed={0.1}
      color="#002244"
    />
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function FactoryScene({
  machines = FACTORY_MACHINES,
  selectedMachineId,
  onMachineClick,
  onRobotClick,
  onRobotStateChange,
  showLabels = true,
  cameraPreset = 'overview',
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 28, 32], fov: 50, near: 0.1, far: 300 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      style={{ background: '#060810' }}
    >
      {/* Environment */}
      <color attach="background" args={['#060810']} />
      <fog attach="fog" args={['#060810', 40, 120]} />

      <SceneLighting />
      <FactoryFloor />
      <AtmosphericParticles />

      {/* Machines */}
      {machines.map(m => (
        <MachineNode
          key={m.id}
          machine={m}
          onClick={onMachineClick}
          selected={m.id === selectedMachineId}
          showLabels={showLabels}
        />
      ))}

      {/* Special areas */}
      <StorageRacks />
      <ControlRoom />
      <ChargingDock />
      <RobotPath />

      {/* Robot */}
      <MobileRobot onRobotClick={onRobotClick} onStateChange={onRobotStateChange} />

      {/* Camera */}
      <CameraController preset={cameraPreset} />
    </Canvas>
  );
}
