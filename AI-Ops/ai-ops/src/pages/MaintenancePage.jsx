import { useState, useEffect } from 'react';
import { maintenanceApi } from '../services/api';
import { RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [woRes, statRes] = await Promise.all([
      maintenanceApi.getWorkOrders(),
      maintenanceApi.getStats(),
    ]);
    if (woRes?.data) setWorkOrders(woRes.data);
    if (statRes?.data) setStats(statRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? workOrders : workOrders.filter(wo => wo.status === filter);

  const handleStatus = async (id, newStatus) => {
    await maintenanceApi.updateStatus(id, newStatus, '');
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Maintenance Management</h1>
          <p>Work orders, scheduling and cost tracking — API: /api/maintenance/work-orders</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={12}/> Refresh</button>
          <button className="btn btn-primary btn-sm" id="create-wo-btn">+ New Work Order</button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="kpi-grid mb-md">
          {[['Total WOs', stats.total, '#1557a8'], ['Open', stats.open, '#c0392b'], ['In Progress', stats.inProgress, '#b86800'], ['Scheduled', stats.scheduled, '#6a3093'], ['Completed', stats.completed, '#1a7a3a'], ['Overdue', stats.overdue, '#c0392b'], ['MTD Cost', `$${(stats.totalCostMtd/1000).toFixed(1)}K`, '#1557a8']].map(([k,v,c]) => (
            <div key={k} className="kpi-card" style={{ '--kpi-color': c }}>
              <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{v}</div>
              <div className="kpi-label">{k}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tab-bar">
        {['ALL','OPEN','IN_PROGRESS','SCHEDULED','COMPLETED','OVERDUE'].map(s => (
          <div key={s} className={`tab-item ${filter===s?'active':''}`} onClick={() => setFilter(s)}
            id={`tab-${s.toLowerCase()}`}>
            {s.replace('_',' ')} ({s==='ALL' ? workOrders.length : workOrders.filter(wo=>wo.status===s).length})
          </div>
        ))}
      </div>

      <div className="panel">
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>WO Number</th><th>Machine</th><th>Type</th><th>Priority</th><th>Status</th>
                <th>Assigned To</th><th>Scheduled</th><th>Est. Hours</th><th>Cost ($)</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading from backend…</td></tr>
              ) : filtered.map(wo => (
                <tr key={wo.id}>
                  <td><strong className="font-mono">{wo.woNumber}</strong></td>
                  <td style={{ fontSize: '11.5px' }}>{wo.machine?.name ?? '—'}<br/>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{wo.machine?.machineCode}</span>
                  </td>
                  <td><span className={`badge badge-${wo.type?.toLowerCase()}`}>{wo.type}</span></td>
                  <td><span className={`badge badge-${wo.priority?.toLowerCase()}`}>{wo.priority}</span></td>
                  <td><span className={`badge badge-${wo.status?.replace('_','-').toLowerCase()}`}>{wo.status?.replace('_',' ')}</span></td>
                  <td style={{ fontSize: '11.5px' }}>{wo.assignedTo || '—'}</td>
                  <td style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>{wo.scheduledDate ?? '—'}</td>
                  <td className="font-mono" style={{ fontSize: '11.5px' }}>{wo.estimatedHours ?? '—'}</td>
                  <td className="font-mono" style={{ fontSize: '11.5px' }}>{wo.cost ? `$${wo.cost.toLocaleString()}` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {wo.status === 'OPEN' && <button className="btn btn-warning btn-xs" onClick={() => handleStatus(wo.id, 'IN_PROGRESS')}>Start</button>}
                      {wo.status === 'IN_PROGRESS' && <button className="btn btn-success btn-xs" onClick={() => handleStatus(wo.id, 'COMPLETED')}>Complete</button>}
                      <button className="btn btn-secondary btn-xs">View</button>
                    </div>
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
