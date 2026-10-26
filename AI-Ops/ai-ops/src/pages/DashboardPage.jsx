import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardApi, machineApi, maintenanceApi, incidentApi, inventoryApi } from '../services/api';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

function KpiCard({ label, value, color, note, icon }) {
  return (
    <div className="kpi-card" style={{ '--kpi-color': color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="kpi-value">{value ?? '…'}</div>
        {icon && <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>{icon}</span>}
      </div>
      <div className="kpi-label">{label}</div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}

import { AssetViewer } from '../simulation/AssetViewer';
import { FACTORY_MACHINES } from '../simulation/SimulationService';
import { FuxaFlowDiagram } from '../simulation/FuxaFlowDiagram';
import { HandGestureController } from '../simulation/HandGestureController';

function LiveSensorsPanel() {
  const [machines, setMachines] = useState(FACTORY_MACHINES.slice(0, 3));
  const [rawTelemetry, setRawTelemetry] = useState(null);
  const [remoteAlert, setRemoteAlert] = useState(null);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [rotationOffset, setRotationOffset] = useState([0, 0]);
  const audioRef = useRef(null);

  // Gesture Handlers
  const handleRotate = useCallback((dx, dy) => {
    setRotationOffset(prev => [prev[0] + dx, prev[1] + dy]);
  }, []);

  const handleZoom = useCallback((dZoom) => {
    setZoomLevel(prev => Math.max(2.5, Math.min(9, prev + dZoom)));
  }, []);

  const handleSwitchModel = useCallback((direction) => {
    setActiveModelIndex(prev => {
      const next = prev + direction;
      if (next < 0) return 2;
      if (next > 2) return 0;
      return next;
    });
  }, []);
  
  useEffect(() => {
    let ws;
    let reconnectTimer;
    let alarmPlaying = false;
    
    const connectWS = () => {
      // Connect to gateway WebSocket
      const wsUrl = `ws://${window.location.hostname || 'localhost'}:8081`;
      console.log('[Dashboard] Connecting to WebSocket:', wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Dashboard] WebSocket connected to Gateway on 8081!');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Dashboard] Received telemetry payload:', data);
          
          // Listen for remote calibrate command from mobile phone
          if (data.type === 'WINDOWS_ALERT') {
            setRemoteAlert(data.message || 'Immediate action required to Machine 2 (M12)!');
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio blocked', e));
            }
            return;
          }

          if (data.status === 'OFFLINE') {
             setMachines(prev => prev.map(m => ({ ...m, status: 'OFFLINE' })));
             if (alarmPlaying && audioRef.current) { audioRef.current.pause(); alarmPlaying = false; }
             return;
          }

          // Robust check for telemetry data
          if (data.dht22 || data.mq2 || data.mq9) {
             setRawTelemetry(data);

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
                  return {
                    ...m,
                    temp: hasErr ? 'ERR' : t,
                    humidity: hasErr ? 'ERR' : h,
                    status: hasErr ? 'WARNING' : t > 40 ? 'CRITICAL' : t > 32 ? 'WARNING' : 'ONLINE'
                  };
               }
               if (m.id === 'MACHINE-002' && data.mq2) {
                  const r = Number(data.mq2.raw);
                  const v = Number(data.mq2.voltage);
                  return {
                    ...m,
                    raw: isNaN(r) ? 0 : r,
                    voltage: isNaN(v) ? 0 : v,
                    status: (r || 0) >= 130 ? 'CRITICAL' : (r || 0) > 90 ? 'WARNING' : 'ONLINE'
                  };
               }
               if (m.id === 'MACHINE-003' && data.mq9) {
                  const r = Number(data.mq9.raw);
                  const v = Number(data.mq9.voltage);
                  return {
                    ...m,
                    raw: isNaN(r) ? 0 : r,
                    voltage: isNaN(v) ? 0 : v,
                    status: (r || 0) >= 130 ? 'CRITICAL' : (r || 0) > 90 ? 'WARNING' : 'ONLINE'
                  };
               }
               return m;
             }));
          }
        } catch(e) {
          console.error('[Dashboard WS] Parse error:', e);
        }
      };
      ws.onclose = () => { 
        if (alarmPlaying && audioRef.current) { audioRef.current.pause(); alarmPlaying = false; }
        reconnectTimer = setTimeout(connectWS, 3000); 
      };
    };
    connectWS();
    return () => { if (ws) ws.close(); clearTimeout(reconnectTimer); };
  }, []);

  return (
    <div className="panel mb-md" style={{ background: '#03060c', position: 'relative' }}>
      <audio ref={audioRef} id="web-horn" src="https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-buzzer-991.mp3" loop preload="auto" />
      
      {/* Remote Windows Critical Alert Modal */}
      {remoteAlert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <div style={{
            background: '#1a0c10',
            border: '2px solid #ff3333',
            borderRadius: 8,
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 15px 40px rgba(255, 51, 51, 0.5)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#ff2222',
              color: '#fff',
              padding: '10px 16px',
              fontWeight: 800,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              letterSpacing: '0.5px'
            }}>
              <span>⚠ WINDOWS HARDWARE ALERT</span>
            </div>
            <div style={{ padding: '24px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>⛔</div>
              <div>
                <h4 style={{ color: '#fff', fontSize: 17, marginBottom: 8, fontWeight: 700 }}>
                  Immediate Action Required
                </h4>
                <p style={{ color: '#ffb3b3', fontSize: 14, lineHeight: 1.5 }}>
                  {remoteAlert}
                </p>
                <div style={{ marginTop: 12, fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
                  Target: MACHINE-002 (M12) · Sensor: MQ-2
                </div>
              </div>
            </div>
            <div style={{
              background: '#12080a',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid #33151a'
            }}>
              <button
                onClick={() => {
                  setRemoteAlert(null);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                }}
                style={{
                  background: '#ff2222',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 24px',
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Acknowledge & Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCADA Dynamic Process Flow */}
      <div style={{ marginBottom: 16 }}>
        <FuxaFlowDiagram telemetry={rawTelemetry} />
      </div>

      {/* Main 3D Machinery View with Optical Hand Gesture Control */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 16,
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 16,
        position: 'relative',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Left: Hand Gesture Camera HUD */}
        <div style={{ flexShrink: 0 }}>
          <HandGestureController
            onRotate={handleRotate}
            onZoom={handleZoom}
            onSwitchModel={handleSwitchModel}
            activeIndex={activeModelIndex}
          />
        </div>

        {/* Center: Interactive 3D Digital Twin Viewer */}
        <div style={{
          flex: 1,
          height: 380,
          background: '#0d1527',
          borderRadius: 6,
          border: '1px solid var(--border-table)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Model Switcher Bar */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: 12,
            right: 12,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {machines.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModelIndex(idx)}
                  style={{
                    background: activeModelIndex === idx ? '#1557a8' : 'rgba(255, 255, 255, 0.9)',
                    border: activeModelIndex === idx ? '1px solid #0e4590' : '1px solid #c8cdd6',
                    color: activeModelIndex === idx ? '#ffffff' : '#1a1a2e',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {m.id} &middot; {m.name}
                </button>
              ))}
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontFamily: 'monospace',
              color: '#fff'
            }}>
              ZOOM: {zoomLevel.toFixed(1)}x | ROTATION: [{rotationOffset[0].toFixed(1)}, {rotationOffset[1].toFixed(1)}]
            </div>
          </div>

          {/* 3D Canvas */}
          <AssetViewer
            asset={machines[activeModelIndex]}
            height="100%"
            zoomLevel={zoomLevel}
            rotationOffset={rotationOffset}
          />
        </div>
      </div>

      <div className="panel mb-md">
        <div className="panel-header">
          <span className="panel-title">Live Physical Sensors (3D Digital Twins)</span>
        </div>
        <div style={{ display: 'flex', gap: 16, padding: '12px' }}>
          {machines.map(m => (
            <div key={m.id} style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)', overflow: 'hidden', background: 'var(--bg-white)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-light)', borderBottom: '1px solid var(--border-table)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.id} &middot; {m.sensorSource}</div>
                </div>
                <div style={{
                  fontSize: 10,
                  color: m.status === 'CRITICAL' ? 'var(--status-critical)' : m.status === 'WARNING' ? 'var(--status-warning)' : m.status === 'ONLINE' ? 'var(--status-online)' : 'var(--text-muted)',
                  fontWeight: 700,
                  background: m.status === 'CRITICAL' ? 'var(--err-bg)' : m.status === 'WARNING' ? 'var(--warn-bg)' : m.status === 'ONLINE' ? 'var(--ok-bg)' : '#eee',
                  padding: '2px 6px',
                  borderRadius: 3,
                  border: `1px solid ${m.status === 'CRITICAL' ? '#f5c6cb' : m.status === 'WARNING' ? '#ffeeba' : m.status === 'ONLINE' ? '#c3e6cb' : '#ddd'}`
                }}>
                  {m.status}
                </div>
              </div>
              
              <div style={{ height: 180, width: '100%', position: 'relative', background: '#0a101d' }}>
                <AssetViewer asset={m} height="100%" />
              </div>

              <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--bg-white)' }}>
                {m.sensorSource === 'DHT22' ? (
                  <>
                    <div style={{ background: 'var(--bg-light)', padding: 8, borderRadius: 4, border: '1px solid var(--border-table)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Temperature</div>
                      <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: (m.temp ?? 0) > 40 ? 'var(--status-critical)' : 'var(--accent)' }}>
                        {typeof m.temp === 'number' ? m.temp.toFixed(1) : (m.temp || '--')}&deg;C
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-light)', padding: 8, borderRadius: 4, border: '1px solid var(--border-table)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Humidity</div>
                      <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>
                        {typeof m.humidity === 'number' ? m.humidity.toFixed(1) : (m.humidity || '--')}%
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'var(--bg-light)', padding: 8, borderRadius: 4, border: '1px solid var(--border-table)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{m.sensorSource} Raw</div>
                      <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: (Number(m.raw) || 0) >= 130 ? 'var(--status-critical)' : 'var(--accent)' }}>
                        {m.raw !== undefined && m.raw !== null ? m.raw : '--'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-light)', padding: 8, borderRadius: 4, border: '1px solid var(--border-table)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Voltage</div>
                      <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {m.voltage !== undefined && m.voltage !== null ? `${Number(m.voltage).toFixed(2)} V` : '-- V'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [machines, setMachines] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, machRes, woRes, incRes, alertRes] = await Promise.all([
        dashboardApi.getKPIs(),
        machineApi.getAll(),
        maintenanceApi.getWorkOrders(),
        incidentApi.getAll(),
        dashboardApi.getAlerts(),
      ]);
      if (kpiRes?.data) setKpis(kpiRes.data);
      if (machRes?.data) setMachines(machRes.data);
      if (woRes?.data) setWorkOrders(woRes.data);
      if (incRes?.data) setIncidents(incRes.data);
      if (alertRes?.data) setAlerts(alertRes.data);
      setLastRefresh(new Date());
      setError('');
    } catch (err) {
      setError('Cannot reach backend server. Ensure Spring Boot is running on port 8080.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const machinesByStatus = (status) => machines.filter(m => m.status === status);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Operations Dashboard</h1>
          <p>Real-time industrial operations overview · Backend: Spring Boot 3.x · DB: H2 · Auth: JWT</p>
        </div>
        <div className="page-actions">
          <span className="live-badge"><span className="live-dot"></span>LIVE</span>
          <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading} id="refresh-dashboard">
            <RefreshCw size={12} /> Refresh
          </button>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
            Updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-critical mb-md">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Live 3D Physical Sensors View */}
      <LiveSensorsPanel />

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard label="Total Machines" value={kpis?.totalMachines} color="#1557a8" icon="🏭" />
        <KpiCard label="Online" value={kpis?.onlineMachines} color="#1a7a3a" icon="✅" note={`${kpis ? Math.round(kpis.onlineMachines/kpis.totalMachines*100) : '…'}% availability`} />
        <KpiCard label="Critical" value={kpis?.criticalMachines} color="#c0392b" icon="🚨" note="Immediate action" />
        <KpiCard label="Warning" value={kpis?.warningMachines} color="#b86800" icon="⚠️" note="Monitor closely" />
        <KpiCard label="Under Maintenance" value={kpis?.maintenanceMachines} color="#6a3093" icon="🔧" />
        <KpiCard label="OEE" value={kpis ? `${kpis.oee}%` : '…'} color="#1557a8" icon="📊" note="Target: 86%" />
        <KpiCard label="Avg. Health Score" value={kpis ? `${kpis.avgHealthScore}%` : '…'} color="#1a7a3a" icon="💓" />
        <KpiCard label="Open Work Orders" value={kpis?.openWorkOrders} color="#b86800" icon="📋" />
        <KpiCard label="Open Incidents" value={kpis?.openIncidents} color="#c0392b" icon="🔴" />
        <KpiCard label="Low Stock Alerts" value={kpis?.lowStockAlerts} color="#b86800" icon="📦" />
        <KpiCard label="MTBF" value={kpis ? `${kpis.mtbf}h` : '…'} color="#1557a8" icon="⏱" />
        <KpiCard label="MTTR" value={kpis ? `${kpis.mttr}h` : '…'} color="#1557a8" icon="⚙️" />
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="panel mb-md">
          <div className="panel-header">
            <span className="panel-title">Active Alerts</span>
            <span className="badge badge-critical">{alerts.length}</span>
          </div>
          <div className="panel-body-sm">
            {alerts.slice(0, 5).map((a, i) => (
              <div key={i} className={`alert alert-${a.type === 'CRITICAL' ? 'critical' : a.type === 'WARNING' ? 'warning' : 'info'} mb-sm`} style={{ marginBottom: 6 }}>
                {a.type === 'CRITICAL' ? <AlertTriangle size={13} /> : a.type === 'WARNING' ? '⚠️' : 'ℹ️'}
                <div>
                  <strong>{a.title}</strong><br />
                  <span style={{ fontSize: '11.5px' }}>{a.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Machine Registry */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Machine Status Overview</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{machines.length} total</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Code</th><th>Machine</th><th>Dept</th><th>Status</th><th>Health</th></tr></thead>
              <tbody>
                {machines.slice(0, 8).map(m => (
                  <tr key={m.id}>
                    <td><span className="font-mono" style={{ fontSize: '11px' }}>{m.machineCode}</span></td>
                    <td><strong>{m.name}</strong></td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.department}</td>
                    <td><span className={`badge badge-${m.status?.toLowerCase()}`}>{m.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="health-bar" style={{ width: 70 }}>
                          <div className="health-fill" style={{ width: `${m.healthScore}%`, background: m.healthScore > 75 ? '#1a7a3a' : m.healthScore > 50 ? '#b86800' : '#c0392b' }}></div>
                        </div>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{m.healthScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Work Orders */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Recent Work Orders</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{workOrders.length} total</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>WO#</th><th>Type</th><th>Priority</th><th>Status</th><th>Assigned</th></tr></thead>
              <tbody>
                {workOrders.slice(0, 7).map(wo => (
                  <tr key={wo.id}>
                    <td><span className="font-mono" style={{ fontSize: '11px' }}>{wo.woNumber}</span></td>
                    <td style={{ fontSize: '11px' }}>{wo.type}</td>
                    <td><span className={`badge badge-${wo.priority?.toLowerCase()}`}>{wo.priority}</span></td>
                    <td><span className={`badge badge-${wo.status?.replace('_','-').toLowerCase()}`}>{wo.status?.replace('_',' ')}</span></td>
                    <td style={{ fontSize: '11px' }}>{wo.assignedTo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Recent Incidents</span>
          <span className="badge badge-open">{incidents.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length} Active</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Incident#</th><th>Machine</th><th>Severity</th><th>Status</th><th>Reported By</th><th>Assigned To</th><th>Reported At</th></tr></thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id}>
                  <td><span className="font-mono" style={{ fontSize: '11px' }}>{inc.incidentNumber}</span></td>
                  <td style={{ fontSize: '11.5px' }}>{inc.machine?.name ?? '—'}</td>
                  <td><span className={`badge badge-${inc.severity?.toLowerCase()}`}>{inc.severity}</span></td>
                  <td><span className={`badge badge-${inc.status?.replace('_','-').toLowerCase()}`}>{inc.status?.replace('_',' ')}</span></td>
                  <td style={{ fontSize: '11.5px' }}>{inc.reportedBy}</td>
                  <td style={{ fontSize: '11.5px' }}>{inc.assignedTo || '—'}</td>
                  <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {inc.reportedAt ? new Date(inc.reportedAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
