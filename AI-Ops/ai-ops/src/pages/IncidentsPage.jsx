import { useState, useEffect } from 'react';
import { incidentApi } from '../services/api';
import { RefreshCw } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [incRes, statRes] = await Promise.all([incidentApi.getAll(), incidentApi.getStats()]);
    if (incRes?.data) setIncidents(incRes.data);
    if (statRes?.data) setStats(statRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? incidents : incidents.filter(i => i.status === filter || i.severity === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Incident Management</h1>
          <p>Track, assign and resolve operational incidents — API: /api/incidents</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={12}/> Refresh</button>
          <button className="btn btn-danger btn-sm" id="report-incident-btn">⚠ Report Incident</button>
        </div>
      </div>

      {stats && (
        <div className="kpi-grid mb-md">
          {[['Total', stats.total,'#1557a8'],['Open', stats.open,'#c0392b'],['In Progress', stats.inProgress,'#b86800'],['Critical', stats.critical,'#c0392b'],['Resolved', stats.resolved,'#1a7a3a'],['Closed', stats.closed,'#6b7a8d']].map(([k,v,c]) => (
            <div key={k} className="kpi-card" style={{'--kpi-color':c}}>
              <div className="kpi-value" style={{fontSize:'1.5rem'}}>{v}</div>
              <div className="kpi-label">{k}</div>
            </div>
          ))}
        </div>
      )}

      <div className="tab-bar">
        {['ALL','OPEN','IN_PROGRESS','RESOLVED','CLOSED','CRITICAL'].map(s => (
          <div key={s} className={`tab-item ${filter===s?'active':''}`} onClick={() => setFilter(s)} id={`incident-tab-${s.toLowerCase()}`}>
            {s.replace('_',' ')}
          </div>
        ))}
      </div>

      <div className="panel">
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Incident#</th><th>Machine</th><th>Severity</th><th>Status</th><th>Description</th><th>Reported By</th><th>Assigned To</th><th>Reported At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9} style={{textAlign:'center',padding:20,color:'var(--text-muted)'}}>Loading…</td></tr>
              : filtered.map(inc => (
                <tr key={inc.id}>
                  <td><strong className="font-mono" style={{fontSize:'11px'}}>{inc.incidentNumber}</strong></td>
                  <td style={{fontSize:'11.5px'}}>{inc.machine?.name ?? '—'}</td>
                  <td><span className={`badge badge-${inc.severity?.toLowerCase()}`}>{inc.severity}</span></td>
                  <td><span className={`badge badge-${inc.status?.replace('_','-').toLowerCase()}`}>{inc.status?.replace('_',' ')}</span></td>
                  <td style={{fontSize:'11.5px',maxWidth:240}}><span className="truncate" title={inc.description}>{inc.description}</span></td>
                  <td style={{fontSize:'11.5px'}}>{inc.reportedBy}</td>
                  <td style={{fontSize:'11.5px'}}>{inc.assignedTo || '—'}</td>
                  <td className="font-mono" style={{fontSize:'10.5px',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{inc.reportedAt ? new Date(inc.reportedAt).toLocaleString() : '—'}</td>
                  <td>
                    <button className="btn btn-secondary btn-xs" onClick={() => setSelected(inc)}>View</button>
                    {(inc.status==='OPEN'||inc.status==='IN_PROGRESS') && <button className="btn btn-success btn-xs" style={{marginLeft:3}} id={`resolve-${inc.id}`}>Resolve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Incident Detail — {selected.incidentNumber}</span>
              <button className="btn btn-secondary btn-xs" onClick={() => setSelected(null)}>✕ Close</button>
            </div>
            <div className="modal-body">
              {[['Incident Number', selected.incidentNumber], ['Machine', selected.machine?.name], ['Severity', selected.severity], ['Status', selected.status], ['Description', selected.description], ['Reported By', selected.reportedBy], ['Assigned To', selected.assignedTo || '—'], ['Root Cause', selected.rootCause || 'Under investigation'], ['Resolution', selected.resolution || 'Pending']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '12.5px' }}>
                  <span style={{ minWidth: 120, color: 'var(--text-muted)', fontWeight: 600 }}>{k}:</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
