import { useState, useEffect } from 'react';
import { machineApi } from '../services/api';
import { RefreshCw, Search } from 'lucide-react';

const STATUS_OPTS = ['ALL', 'ONLINE', 'WARNING', 'CRITICAL', 'MAINTENANCE', 'OFFLINE'];

export default function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await machineApi.getAll();
    if (res?.data) setMachines(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const viewDetails = async (m) => {
    setSelected(m);
    setTelemetry(null);
    const res = await machineApi.getTelemetry(m.id);
    if (res?.data) setTelemetry(res.data);
  };

  const filtered = machines.filter(m =>
    (filter === 'ALL' || m.status === filter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.machineCode.toLowerCase().includes(search.toLowerCase()) || (m.department || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Machine Registry</h1>
          <p>All registered industrial machines — API: GET /api/machines</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={12} /> Refresh</button>
          <button className="btn btn-primary btn-sm" id="add-machine-btn">+ Register Machine</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="panel panel-body-sm mb-md">
        <div className="toolbar">
          <div className="filter-bar">
            <Search size={12} style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search machines…" value={search} onChange={e => setSearch(e.target.value)} id="machine-search" />
          </div>
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setFilter(s)} id={`filter-${s.toLowerCase()}`}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '11px' }}>
              {s === 'ALL' ? `ALL (${machines.length})` : `${s} (${machines.filter(m=>m.status===s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Machine Registry</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Machine Code</th><th>Name</th><th>Type</th><th>Department</th>
                <th>Status</th><th>Health %</th><th>Serial No.</th>
                <th>Install Date</th><th>Next Maintenance</th><th>Location</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading from backend…</td></tr>
              ) : filtered.map(m => (
                <tr key={m.id}>
                  <td><strong className="font-mono">{m.machineCode}</strong></td>
                  <td><strong>{m.name}</strong></td>
                  <td style={{ fontSize: '11px' }}>{m.type}</td>
                  <td style={{ fontSize: '11px' }}>{m.department}</td>
                  <td><span className={`badge badge-${m.status?.toLowerCase()}`}>{m.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div className="health-bar" style={{ width: 60 }}>
                        <div className="health-fill" style={{ width: `${m.healthScore}%`, background: m.healthScore > 75 ? '#1a7a3a' : m.healthScore > 50 ? '#b86800' : '#c0392b' }}></div>
                      </div>
                      <span className="font-mono" style={{ fontSize: '11px' }}>{m.healthScore}%</span>
                    </div>
                  </td>
                  <td className="font-mono" style={{ fontSize: '11px' }}>{m.serialNo}</td>
                  <td style={{ fontSize: '11px' }}>{m.installDate}</td>
                  <td style={{ fontSize: '11px', color: m.nextMaintenance && new Date(m.nextMaintenance) < new Date() ? 'var(--status-critical)' : 'var(--text-secondary)' }}>{m.nextMaintenance ?? '—'}</td>
                  <td style={{ fontSize: '11px' }}>{m.location}</td>
                  <td>
                    <button className="btn btn-secondary btn-xs" onClick={() => viewDetails(m)} id={`view-${m.machineCode}`}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <span className="modal-title">Machine Details — {selected.machineCode}</span>
              <button className="btn btn-secondary btn-xs" onClick={() => setSelected(null)}>✕ Close</button>
            </div>
            <div className="modal-body">
              <div className="grid-2 mb-md">
                <div>
                  <div className="section-label">Machine Information</div>
                  {[['Machine Code', selected.machineCode], ['Name', selected.name], ['Type', selected.type], ['Department', selected.department], ['Location', selected.location], ['Serial No.', selected.serialNo]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                      <span style={{ minWidth: 110, color: 'var(--text-muted)', fontWeight: 600 }}>{k}:</span>
                      <span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="section-label">Status & Lifecycle</div>
                  {[['Status', selected.status], ['Health Score', `${selected.healthScore}%`], ['Performance', `${selected.performanceScore}%`], ['Install Date', selected.installDate], ['Warranty', selected.warrantyExpiry], ['Lifetime', `${selected.lifetimeYears} years`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                      <span style={{ minWidth: 110, color: 'var(--text-muted)', fontWeight: 600 }}>{k}:</span>
                      <span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {telemetry ? (
                <div>
                  <div className="section-label">Live Telemetry — Source: GET /api/machines/{selected.id}/telemetry</div>
                  <table className="data-table">
                    <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
                    <tbody>
                      {[['Temperature', telemetry.temperature, '°C'], ['Vibration', telemetry.vibration, 'mm/s'], ['Voltage', telemetry.voltage, 'V'], ['Current', telemetry.current, 'A'], ['Power', telemetry.powerKw, 'kW'], ['Runtime Hours', telemetry.runtimeHours, 'hrs'], ['Production Count', telemetry.productionCount, 'units']].map(([k,v,u]) => (
                        <tr key={k}>
                          <td style={{ fontWeight: 600 }}>{k}</td>
                          <td className="font-mono">{v}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: 6 }}>Timestamp: {telemetry.timestamp}</div>
                </div>
              ) : <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '12px' }}>Loading telemetry…</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-warning btn-sm" id="schedule-maintenance-btn">Schedule Maintenance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
