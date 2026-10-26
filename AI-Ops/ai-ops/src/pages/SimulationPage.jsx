import { useState, useEffect, useCallback, useRef } from 'react';
import FactoryScene from '../simulation/FactoryScene';
import { AssetViewer } from '../simulation/AssetViewer';
import {
  FACTORY_MACHINES, AI_INSIGHTS, INITIAL_TIMELINE,
  CAMERA_PRESETS, fluctuate, generateRobotEvent
} from '../simulation/SimulationService';

// ── Simulation-specific styles (dark theme override) ─────────────────────────
const S = {
  page: {
    position: 'fixed', top: 'var(--topbar-h)', left: 'var(--sidebar-w)',
    right: 0, bottom: 0, background: '#060810', zIndex: 10,
    display: 'flex', flexDirection: 'column', fontFamily: '"Roboto", sans-serif',
    overflow: 'hidden',
  },
  toolbar: {
    height: 40, background: '#080f1c', borderBottom: '1px solid #0e2040',
    display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px',
    flexShrink: 0,
  },
  toolbarLabel: { fontSize: 10, color: '#4a7a9a', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginRight: 4 },
  btn: (active) => ({
    padding: '3px 10px', fontSize: 11, borderRadius: 3, cursor: 'pointer', fontFamily: '"Roboto Mono",monospace',
    background: active ? '#0e3a6a' : 'rgba(255,255,255,0.04)',
    border: active ? '1px solid #00aaff' : '1px solid #0e2040',
    color: active ? '#00ccff' : '#5a8aaa',
    transition: 'all 0.15s',
  }),
  toggleBtn: (active) => ({
    padding: '3px 10px', fontSize: 11, borderRadius: 3, cursor: 'pointer',
    background: active ? '#0a2a1a' : 'rgba(255,255,255,0.04)',
    border: active ? '1px solid #00aa44' : '1px solid #0e2040',
    color: active ? '#00ff88' : '#5a8aaa',
  }),
  liveChip: {
    display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
    background: '#001a10', border: '1px solid #00aa44', borderRadius: 3,
    padding: '2px 10px', fontSize: 10, color: '#00ff88', fontFamily: '"Roboto Mono",monospace',
  },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#00ff44', animation: 'simPulse 1.4s ease-in-out infinite' },
  main: { flex: 1, display: 'flex', overflow: 'hidden' },
  canvas: { flex: 1, position: 'relative', overflow: 'hidden' },
  rightPanel: {
    width: 290, background: '#07101e', borderLeft: '1px solid #0e2040',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
  },
  panelHeader: {
    padding: '8px 12px', borderBottom: '1px solid #0e2040',
    background: '#080f1c', fontSize: 11, fontWeight: 700,
    color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.8,
    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
  },
  timeline: {
    height: 130, background: '#06090f', borderTop: '1px solid #0e2040',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  timelineHeader: {
    height: 28, background: '#07101e', borderBottom: '1px solid #0e2040',
    display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
    fontSize: 10, color: '#4a7aaa', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', flexShrink: 0,
  },
  timelineBody: { flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'row', gap: 0, padding: '4px 0' },
  timelineItem: (type) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '2px 14px',
    minWidth: 280, fontSize: 11, color: '#5a8aaa', whiteSpace: 'nowrap',
    borderRight: '1px solid #0e2040',
  }),
};

// ── Status colors for UI panels ───────────────────────────────────────────────
const statusStyle = (s) => ({
  ONLINE:      { color: '#00aaff', bg: 'rgba(0,120,255,0.1)', border: '#0044aa' },
  WARNING:     { color: '#ff8800', bg: 'rgba(255,120,0,0.1)', border: '#884400' },
  CRITICAL:    { color: '#ff3333', bg: 'rgba(255,0,0,0.12)', border: '#880000' },
  MAINTENANCE: { color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', border: '#553a7a' },
  OFFLINE:     { color: '#446688', bg: 'rgba(0,0,0,0.15)', border: '#223344' },
}[s] || { color: '#446688', bg: '#0a0e18', border: '#0e2040' });

const typeColor = (t) => ({ critical: '#ff3333', warning: '#ff8800', info: '#00aaff', ok: '#00cc66', robot: '#00ccff' }[t] || '#446688');

// ── Mini Map ──────────────────────────────────────────────────────────────────
function MiniMap({ machines, robotState }) {
  const W = 268, H = 130;
  const scale = (x, range) => ((x + range / 2) / range) * W;
  const scaleZ = (z, range) => ((z + range / 2) / range) * H;
  const RANGE_X = 52, RANGE_Z = 44;

  return (
    <div style={{ position: 'relative', width: W, height: H, background: '#030609', margin: '0 auto', borderRadius: 4, border: '1px solid #0e2040', overflow: 'hidden' }}>
      {/* Grid lines */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * W / 7} y1={0} x2={(i + 1) * W / 7} y2={H} stroke="#0a1a28" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * H / 5} x2={W} y2={(i + 1) * H / 5} stroke="#0a1a28" strokeWidth={0.5} />
        ))}
        {/* Charging dock */}
        <circle cx={scale(-18, RANGE_X)} cy={scaleZ(10, RANGE_Z)} r={6} fill="#002200" stroke="#00aa44" strokeWidth={1} />
        <text x={scale(-18, RANGE_X)} y={scaleZ(10, RANGE_Z) + 1} textAnchor="middle" dominantBaseline="middle" fill="#00ff44" fontSize={7} fontFamily="monospace">⚡</text>
        {/* Machines */}
        {machines.map(m => {
          const ss = statusStyle(m.status);
          const cx = scale(m.pos[0], RANGE_X);
          const cy = scaleZ(m.pos[2], RANGE_Z);
          return (
            <g key={m.id}>
              <rect x={cx - 6} y={cy - 5} width={12} height={10} rx={1} fill={ss.bg} stroke={ss.color} strokeWidth={0.8} />
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill={ss.color} fontSize={5} fontFamily="monospace">{m.code.split('-')[1]}</text>
            </g>
          );
        })}
        {/* Robot path */}
        {[[-18, 10], [-14, -10], [-6, -10], [4, -10], [14, -10], [14, 4], [4, 4], [-6, 4], [-14, 4], [-18, 10]].map(([x, z], i, arr) => {
          if (i === 0) return null;
          const [px, pz] = arr[i - 1];
          return <line key={i} x1={scale(px, RANGE_X)} y1={scaleZ(pz, RANGE_Z)} x2={scale(x, RANGE_X)} y2={scaleZ(z, RANGE_Z)} stroke="#003366" strokeWidth={0.6} strokeDasharray="2,2" />;
        })}
        {/* Robot */}
        {robotState && (
          <>
            <circle cx={scale(robotState.pos?.[0] ?? -18, RANGE_X)} cy={scaleZ(robotState.pos?.[2] ?? 10, RANGE_Z)} r={5} fill="#001a33" stroke="#00aaff" strokeWidth={1.5} />
            <text x={scale(robotState.pos?.[0] ?? -18, RANGE_X)} y={scaleZ(robotState.pos?.[2] ?? 10, RANGE_Z) + 1} textAnchor="middle" dominantBaseline="middle" fill="#00ccff" fontSize={6}>🤖</text>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Robot Panel ───────────────────────────────────────────────────────────────
function RobotPanel({ robotState }) {
  if (!robotState) return null;
  const battery = robotState.battery ?? 100;
  const phase = robotState.phase ?? 'idle';

  const phaseColor = { charging: '#00ff44', moving: '#00aaff', inspecting: '#ffaa00', idle: '#446688' };
  const pc = phaseColor[phase] || '#446688';

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Robot status */}
      <div style={{ background: '#0a1828', border: `1px solid ${pc}33`, borderRadius: 4, padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#cce0ff' }}>AMR-01</span>
          <span style={{ fontSize: 10, color: pc, background: `${pc}18`, border: `1px solid ${pc}44`, borderRadius: 2, padding: '2px 7px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
            ● {phase}
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#446688', marginBottom: 4 }}>Autonomous Mobile Robot v2.1</div>
        <div style={{ fontSize: 11, color: '#7a9abb' }}>
          📍 {robotState.name || 'Transit'}
        </div>
      </div>

      {/* Battery */}
      <div style={{ background: '#060e1a', border: '1px solid #0e2040', borderRadius: 4, padding: '8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Battery</span>
          <span style={{ fontSize: 11, color: battery > 50 ? '#00ff88' : battery > 20 ? '#ffaa00' : '#ff3333', fontFamily: 'monospace', fontWeight: 700 }}>{battery}%</span>
        </div>
        <div style={{ height: 6, background: '#0a1828', borderRadius: 3, overflow: 'hidden', border: '1px solid #0e2040' }}>
          <div style={{ height: '100%', width: `${battery}%`, background: battery > 50 ? '#00cc66' : battery > 20 ? '#ffaa00' : '#ff3333', borderRadius: 3, transition: 'width 0.5s' }} />
        </div>
      </div>

      {/* Sensor grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[['Lidar', '360° · Active', '#00ccff'], ['Camera', 'HD · Recording', '#00aaff'], ['IMU', 'Stable', '#00cc66'], ['GPS/UWB', 'Signal OK', '#00cc66']].map(([k, v, c]) => (
          <div key={k} style={{ background: '#060e1a', border: '1px solid #0e2040', borderRadius: 3, padding: '6px 8px' }}>
            <div style={{ fontSize: 9, color: '#4a7aaa', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
            <div style={{ fontSize: 10, color: c, fontFamily: 'monospace' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Mission stats */}
      <div style={{ background: '#060e1a', border: '1px solid #0e2040', borderRadius: 4, padding: '8px 12px' }}>
        <div style={{ fontSize: 10, color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Mission Status</div>
        {[
          ['Current Action', phase.toUpperCase()],
          ['Target', robotState.name || '—'],
          ['Waypoint', `${(robotState.waypointIndex ?? 0) + 1} / ${9}`],
          ['Speed', phase === 'moving' ? '4.5 m/s' : '0.0 m/s'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', borderBottom: '1px solid #0a1828' }}>
            <span style={{ color: '#4a7aaa' }}>{k}</span>
            <span style={{ color: '#90b8d8', fontFamily: 'monospace' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* AI inspection summary */}
      <div style={{ background: '#060e1a', border: '1px solid #0e3a5a', borderRadius: 4, padding: '8px 12px' }}>
        <div style={{ fontSize: 10, color: '#00aaff', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>🤖 AI Inspection Report</div>
        <div style={{ fontSize: 11, color: '#7a9abb', lineHeight: 1.6 }}>
          Last scan: <span style={{ color: '#00ff88' }}>All systems nominal</span><br />
          Anomalies: <span style={{ color: '#ff8800' }}>1 critical (MCH-006)</span><br />
          Bearing wear: <span style={{ color: '#ffaa00' }}>MCH-002 at 68%</span>
        </div>
      </div>
    </div>
  );
}

// ── Machine Detail Panel ──────────────────────────────────────────────────────
function MachineDetailPanel({ machine, onClose }) {
  if (!machine) return null;
  const ss = statusStyle(machine.status);

  return (
    <div style={{
      position: 'absolute', right: 295, top: 0, bottom: 0, width: 300,
      background: '#07101e', borderLeft: '1px solid #0e2040',
      zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{ background: '#080f1c', borderBottom: `2px solid ${ss.color}44`, padding: '10px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#cce0ff', marginBottom: 2 }}>{machine.name}</div>
            <div style={{ fontSize: 10, color: '#4a7aaa', fontFamily: 'monospace' }}>{machine.code} · {machine.dept}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a7aaa', cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: ss.color, display: 'inline-block', boxShadow: `0 0 6px ${ss.color}` }}></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: ss.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{machine.status}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Isolated 3D Model Viewer */}
        {machine.model && (
          <div style={{ height: 220, borderRadius: 6, overflow: 'hidden', border: '1px solid #0e2040', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 5, left: 5, zIndex: 10, fontSize: 9, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 3, color: '#00aaff', border: '1px solid #00aaff44' }}>
              ISOLATED 3D PREVIEW
            </div>
            <AssetViewer asset={machine} height="100%" />
          </div>
        )}

        {/* Live telemetry */}
        <div style={{ background: '#060e1a', border: '1px solid #0e2040', borderRadius: 4, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live Telemetry</span>
            <span style={{ fontSize: 9, color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 6px', borderRadius: 2, border: '1px solid #00aa55' }}>● REAL SENSOR</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(machine.sensorSource === 'DHT22' ? [
              ['Temperature', `${(machine.temp || 0).toFixed(1)}°C`, machine.temp > 40 ? '#ff3333' : machine.temp > 32 ? '#ffaa00' : '#00aaff'],
              ['Humidity', `${(machine.humidity || 0).toFixed(1)}%`, '#00aaff'],
              ['Sensor', 'DHT22', '#6a8aaa'],
            ] : [
              [`${machine.sensorSource} Raw`, `${Math.floor(machine.raw || 0)}`, machine.raw > 600 ? '#ff3333' : machine.raw > 400 ? '#ffaa00' : '#00aaff'],
              [`Voltage`, `${(machine.voltage || 0).toFixed(2)} V`, machine.voltage > 2.5 ? '#ff3333' : '#00aaff'],
              ['Sensor', machine.sensorSource, '#6a8aaa'],
            ]).concat([
              ['Health Score', `${machine.health.toFixed(0)}%`, machine.health > 80 ? '#00cc66' : machine.health > 60 ? '#ffaa00' : '#ff3333'],
            ]).map(([k, v, c]) => (
              <div key={k} style={{ background: '#0a1828', borderRadius: 3, padding: '6px 8px' }}>
                <div style={{ fontSize: 9, color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, color: c, fontFamily: 'monospace', fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Health gauge */}
        <div style={{ background: '#060e1a', border: '1px solid #0e2040', borderRadius: 4, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Health Score</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: machine.health > 80 ? '#00cc66' : machine.health > 60 ? '#ffaa00' : '#ff3333', fontFamily: 'monospace' }}>{machine.health.toFixed(0)}%</span>
          </div>
          <div style={{ height: 10, background: '#0a1828', borderRadius: 5, overflow: 'hidden', border: '1px solid #0e2040' }}>
            <div style={{ height: '100%', width: `${machine.health}%`, background: machine.health > 80 ? 'linear-gradient(90deg,#007744,#00cc66)' : machine.health > 60 ? 'linear-gradient(90deg,#885500,#ffaa00)' : 'linear-gradient(90deg,#880000,#ff3333)', borderRadius: 5, transition: 'width 0.8s' }} />
          </div>
        </div>

        {/* AI Analysis */}
        <div style={{ background: '#060e1a', border: '1px solid #003a5a', borderRadius: 4, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#00aaff', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>🤖 AI Analysis</div>
          <div style={{ fontSize: 11, color: '#7a9abb', lineHeight: 1.7 }}>
            {machine.status === 'ONLINE' && `Machine operating within normal parameters. Predictive model confidence: 94%. Next maintenance recommended in ${Math.floor(machine.health / 10)} days.`}
            {machine.status === 'WARNING' && `Anomaly detected in operational data. Bearing wear probability: 68%. Recommend inspection within 72 hours to prevent unplanned downtime.`}
            {machine.status === 'CRITICAL' && `CRITICAL: Multiple sensor thresholds exceeded. Immediate shutdown and inspection required. Estimated repair time: 4-6 hours.`}
            {machine.status === 'MAINTENANCE' && `Under scheduled maintenance. Progress: 65% complete. ETA: 2h 15m. Assigned: John Smith.`}
          </div>
        </div>

        {/* Maintenance history */}
        <div style={{ background: '#060e1a', border: '1px solid #0e2040', borderRadius: 4, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#4a7aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Maintenance History</div>
          {[
            { date: '2026-06-15', type: 'Preventive', status: 'Completed' },
            { date: '2026-04-10', type: 'Corrective', status: 'Completed' },
            { date: '2026-02-22', type: 'Predictive', status: 'Completed' },
          ].map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #0a1828', fontSize: 11 }}>
              <span style={{ color: '#4a7aaa', fontFamily: 'monospace', fontSize: 10 }}>{h.date}</span>
              <span style={{ color: '#7a9abb' }}>{h.type}</span>
              <span style={{ color: '#00cc66', fontSize: 10 }}>✓ {h.status}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ flex: 1, padding: '7px 0', background: '#0a2a44', border: '1px solid #1a5a88', borderRadius: 3, color: '#00aaff', fontSize: 11, cursor: 'pointer', fontFamily: '"Roboto",sans-serif' }}>
            📋 Work Order
          </button>
          <button style={{ flex: 1, padding: '7px 0', background: '#1a0a00', border: '1px solid #884400', borderRadius: 3, color: '#ff8800', fontSize: 11, cursor: 'pointer', fontFamily: '"Roboto",sans-serif' }}>
            ⚠ Alert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI Insights Panel ─────────────────────────────────────────────────────────
function AIInsightsPanel({ machines }) {
  const [insights, setInsights] = useState(AI_INSIGHTS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(n => n + 1);
      // Occasionally add a new insight
      if (Math.random() < 0.2) {
        const randomMachine = machines[Math.floor(Math.random() * machines.length)];
        const newInsight = {
          id: Date.now(),
          type: 'info',
          icon: '📊',
          text: `${randomMachine.name} efficiency updated: ${randomMachine.efficiency.toFixed(0)}% (${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 2).toFixed(1)}%)`,
          time: 'now',
        };
        setInsights(prev => [newInsight, ...prev].slice(0, 12));
      }
    }, 4000);
    return () => clearInterval(t);
  }, [machines]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {insights.map(ins => (
        <div key={ins.id} style={{
          background: '#060e1a', border: `1px solid ${typeColor(ins.type)}22`,
          borderLeft: `2px solid ${typeColor(ins.type)}`,
          borderRadius: 3, padding: '7px 10px',
          animation: ins.time === 'now' ? 'simFadeIn 0.4s ease' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 12 }}>{ins.icon}</span>
            <span style={{ fontSize: 9, color: '#334a5a', fontFamily: 'monospace' }}>{ins.time}</span>
          </div>
          <div style={{ fontSize: 11, color: '#7a9abb', lineHeight: 1.5 }}>{ins.text}</div>
        </div>
      ))}
    </div>
  );
}

// ── Live Timeline ─────────────────────────────────────────────────────────────
function LiveTimeline({ events }) {
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [events.length]);

  const evColor = { critical: '#ff3333', warning: '#ff8800', info: '#00aaff', ok: '#00cc66', robot: '#00ccff' };

  return (
    <div ref={scrollRef} style={S.timelineBody}>
      {events.map((ev, i) => (
        <div key={ev.id} style={S.timelineItem(ev.type)}>
          <span style={{ fontSize: 10, color: '#334a5a', fontFamily: 'monospace', minWidth: 36 }}>{ev.time}</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: evColor[ev.type] || '#446688', display: 'inline-block', flexShrink: 0 }}></span>
          <span style={{ fontSize: 11, color: evColor[ev.type] || '#446688' }}>{ev.text}</span>
        </div>
      ))}
    </div>
  );
}

// ── Machine Fleet Status Bar ──────────────────────────────────────────────────
function FleetStatusBar({ machines }) {
  const counts = { ONLINE: 0, WARNING: 0, CRITICAL: 0, MAINTENANCE: 0, OFFLINE: 0 };
  machines.forEach(m => { counts[m.status] = (counts[m.status] || 0) + 1; });
  const avgHealth = (machines.reduce((s, m) => s + m.health, 0) / machines.length).toFixed(1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', marginRight: 12 }}>
      {[['ONLINE', '#00aaff'], ['WARNING', '#ff8800'], ['CRITICAL', '#ff3333'], ['MAINT', '#9b59b6']].map(([k, c]) => (
        <span key={k} style={{ fontSize: 10, color: c, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block' }}></span>
          {counts[k] ?? counts['MAINTENANCE'] ?? 0}
        </span>
      ))}
      <span style={{ fontSize: 10, color: '#446688', marginLeft: 4 }}>|</span>
      <span style={{ fontSize: 10, color: '#7a9abb', fontFamily: 'monospace' }}>AVG HEALTH: <span style={{ color: '#00aaff' }}>{avgHealth}%</span></span>
    </div>
  );
}

// ── Main Simulation Page ──────────────────────────────────────────────────────
export default function SimulationPage() {
  const [machines, setMachines] = useState(FACTORY_MACHINES);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [robotState, setRobotState] = useState(null);
  const [robotPanelOpen, setRobotPanelOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [activePanel, setActivePanel] = useState('ai'); // 'ai' | 'robot' | 'fleet'

  // Live Physical Sensor WebSocket Integration
  const audioRef = useRef(null);

  useEffect(() => {
    let ws;
    let reconnectTimer;
    let alarmPlaying = false;
    
    const connectWS = () => {
      ws = new WebSocket('ws://localhost:8081');
      
      ws.onopen = () => console.log('[AI-Ops] Connected to Edge Gateway WebSocket');
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.status === 'OFFLINE') {
             setMachines(prev => prev.map(m => ({ ...m, status: 'OFFLINE' })));
             if (alarmPlaying && audioRef.current) { audioRef.current.pause(); alarmPlaying = false; }
             return;
          }
          
          if (data.dht22 || data.mq2 || data.mq9) {
             const mq2Val = Number(data.mq2?.raw ?? 0);
             // Check Alarm Condition
             if (mq2Val >= 130) {
               if (!alarmPlaying && audioRef.current) {
                 audioRef.current.play().catch(e => console.log('Audio blocked', e));
                 alarmPlaying = true;
               }
             } else {
               if (alarmPlaying && audioRef.current) {
                 audioRef.current.pause();
                 audioRef.current.currentTime = 0;
                 alarmPlaying = false;
               }
             }

             setMachines(prev => prev.map(m => {
               if (m.id === 'MACHINE-001' && data.dht22) {
                  const t = data.dht22.temperature != null ? Number(data.dht22.temperature) : null;
                  const h = data.dht22.humidity != null ? Number(data.dht22.humidity) : null;
                  const hasErr = data.dht22.error || t == null;
                  const status = hasErr ? 'WARNING' : t > 40 ? 'CRITICAL' : t > 32 ? 'WARNING' : 'ONLINE';
                  return { ...m, temp: hasErr ? 'ERR' : t, humidity: hasErr ? 'ERR' : h, status };
               }
               if (m.id === 'MACHINE-002' && data.mq2) {
                  const r = Number(data.mq2.raw) || 0;
                  const v = Number(data.mq2.voltage) || 0;
                  const status = r >= 130 ? 'CRITICAL' : r > 90 ? 'WARNING' : 'ONLINE';
                  return { ...m, raw: r, voltage: v, status };
               }
               if (m.id === 'MACHINE-003' && data.mq9) {
                  const r = Number(data.mq9.raw) || 0;
                  const v = Number(data.mq9.voltage) || 0;
                  const status = r >= 130 ? 'CRITICAL' : r > 90 ? 'WARNING' : 'ONLINE';
                  return { ...m, raw: r, voltage: v, status };
               }
               return m;
             }));
          }
        } catch (e) {
          console.error('WebSocket Error:', e);
        }
      };
      
      ws.onclose = () => {
        console.warn('[AI-Ops] Edge Gateway disconnected. Retrying in 3s...');
        setMachines(prev => prev.map(m => ({ ...m, status: 'OFFLINE' })));
        if (alarmPlaying && audioRef.current) { audioRef.current.pause(); alarmPlaying = false; }
        reconnectTimer = setTimeout(connectWS, 3000);
      };
    };
    
    connectWS();
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  // Robot state → timeline events
  const handleRobotState = useCallback((state) => {
    setRobotState(state);
    if (state.phase !== 'moving') {
      setTimeline(prev => generateRobotEvent(state.name, state.phase, prev));
    }
  }, []);

  const handleMachineClick = useCallback((machine) => {
    setSelectedMachine(prev => prev?.id === machine.id ? null : machine);
    setRobotPanelOpen(false);
  }, []);

  const handleRobotClick = useCallback(() => {
    setRobotPanelOpen(prev => !prev);
    setSelectedMachine(null);
    setActivePanel('robot');
  }, []);

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes simPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes simFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #060e1a; }
        ::-webkit-scrollbar-thumb { background: #0e2a44; border-radius: 2px; }
      `}</style>

      <div style={S.page}>
        <audio ref={audioRef} id="sim-horn" src="https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-buzzer-991.mp3" loop preload="auto" />
        {/* ── Toolbar ── */}
        <div style={S.toolbar}>
          <span style={S.toolbarLabel}>Camera</span>
          {Object.entries(CAMERA_PRESETS).map(([key, val]) => (
            <button key={key} style={S.btn(cameraPreset === key)} onClick={() => setCameraPreset(key)} id={`sim-cam-${key}`}>
              {val.label}
            </button>
          ))}

          <span style={{ ...S.toolbarLabel, marginLeft: 10 }}>Display</span>
          <button style={S.toggleBtn(showLabels)} onClick={() => setShowLabels(v => !v)} id="sim-toggle-labels">
            {showLabels ? '● Labels' : '○ Labels'}
          </button>
          <button style={S.toggleBtn(showPath)} onClick={() => setShowPath(v => !v)} id="sim-toggle-path">
            {showPath ? '● Path' : '○ Path'}
          </button>

          <FleetStatusBar machines={machines} />

          <div style={S.liveChip}>
            <span style={S.liveDot}></span>
            LIVE SIMULATION
          </div>
        </div>

        {/* ── Main Area ── */}
        <div style={S.main}>
          {/* 3D Canvas */}
          <div style={S.canvas}>
            <FactoryScene
              machines={machines}
              selectedMachineId={selectedMachine?.id}
              onMachineClick={handleMachineClick}
              onRobotClick={handleRobotClick}
              onRobotStateChange={handleRobotState}
              showLabels={showLabels}
              cameraPreset={cameraPreset}
            />

            {/* Canvas overlays */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
              <div style={{ background: 'rgba(6,8,16,0.85)', border: '1px solid #0e2040', borderRadius: 4, padding: '5px 10px', fontSize: 10, color: '#4a7aaa', fontFamily: 'monospace' }}>
                🏭 AI-Ops Factory · Spring Boot API · Simulated IoT
              </div>
              {robotState && robotState.phase !== 'moving' && (
                <div style={{ background: 'rgba(0,20,40,0.9)', border: '1px solid #00aaff44', borderRadius: 4, padding: '5px 10px', fontSize: 10, color: '#00aaff', fontFamily: 'monospace', animation: 'simFadeIn 0.3s' }}>
                  🤖 AMR-01 {robotState.phase === 'charging' ? '⚡ CHARGING' : `🔍 INSPECTING: ${robotState.name}`}
                </div>
              )}
            </div>

            {/* Click hint */}
            <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 10, color: '#1e3a5a', fontFamily: 'monospace', pointerEvents: 'none' }}>
              Click machine to inspect · Drag to orbit · Scroll to zoom
            </div>

            {/* Machine Detail Slide-over */}
            {selectedMachine && (
              <MachineDetailPanel 
                machine={machines.find(m => m.id === selectedMachine.id) || selectedMachine} 
                onClose={() => setSelectedMachine(null)} 
              />
            )}
          </div>

          {/* ── Right Panel ── */}
          <div style={S.rightPanel}>
            {/* Panel Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #0e2040', flexShrink: 0 }}>
              {[['ai', '🤖 AI Insights'], ['robot', '🚗 Robot'], ['fleet', '🗺 Fleet Map']].map(([k, label]) => (
                <button key={k} onClick={() => setActivePanel(k)} style={{
                  flex: 1, padding: '7px 0', background: activePanel === k ? '#07101e' : '#060a12',
                  border: 'none', borderBottom: activePanel === k ? '2px solid #00aaff' : '2px solid transparent',
                  color: activePanel === k ? '#00aaff' : '#4a7aaa', fontSize: 10, cursor: 'pointer',
                  fontFamily: '"Roboto",sans-serif', fontWeight: 600, letterSpacing: 0.3,
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            {activePanel === 'ai' && (
              <>
                <div style={S.panelHeader}>
                  <span>🤖</span> AI Insights
                  <span style={{ marginLeft: 'auto', fontSize: 9, color: '#2a4a6a', fontFamily: 'monospace' }}>auto-refresh</span>
                </div>
                <AIInsightsPanel machines={machines} />
              </>
            )}

            {activePanel === 'robot' && (
              <>
                <div style={S.panelHeader}><span>🚗</span> Robot Status</div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <RobotPanel robotState={robotState} />
                </div>
              </>
            )}

            {activePanel === 'fleet' && (
              <>
                <div style={S.panelHeader}><span>🗺</span> Factory Map</div>
                <div style={{ padding: 10, flex: 1, overflowY: 'auto' }}>
                  <MiniMap machines={machines} robotState={robotState} />
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {machines.slice(0, 9).map(m => {
                      const ss = statusStyle(m.status);
                      return (
                        <div key={m.id} onClick={() => handleMachineClick(m)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 3, background: '#060e1a', border: `1px solid ${ss.border}`, cursor: 'pointer' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ss.color, flexShrink: 0 }}></span>
                          <span style={{ fontSize: 10, color: '#7a9abb', flex: 1 }}>{m.code}</span>
                          <span style={{ fontSize: 10, color: ss.color, fontFamily: 'monospace' }}>{m.health.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Live Timeline ── */}
        <div style={S.timeline}>
          <div style={S.timelineHeader}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00aaff', animation: 'simPulse 1.4s infinite' }}></span>
            Live Event Timeline
            <span style={{ marginLeft: 'auto', fontSize: 9, color: '#2a4a6a', fontFamily: 'monospace' }}>Scroll →</span>
          </div>
          <LiveTimeline events={timeline} />
        </div>
      </div>
    </>
  );
}
