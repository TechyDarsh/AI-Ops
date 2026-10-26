import { Save, Settings, Bell, Shield, Database, Cloud } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>System Settings</h1>
            <p>Configure platform settings, thresholds and integrations</p>
          </div>
          <button className="btn btn-primary" id="save-settings-btn"><Save size={14} /> Save Settings</button>
        </div>
      </div>

      <div className="grid-2">
        {/* General Settings */}
        <div className="card">
          <div className="card-header"><div className="card-title"><Settings size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />General Settings</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group"><label className="form-label">Platform Name</label><input className="form-control" defaultValue="AI-Ops Industrial Intelligence Platform" /></div>
            <div className="form-group"><label className="form-label">Organization</label><input className="form-control" defaultValue="Industrial Corp. Ltd." /></div>
            <div className="form-group"><label className="form-label">Timezone</label>
              <select className="form-control"><option>Asia/Kolkata (UTC+5:30)</option><option>UTC</option><option>America/New_York</option></select>
            </div>
            <div className="form-group"><label className="form-label">Date Format</label>
              <select className="form-control"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
            </div>
            <div className="form-group"><label className="form-label">Data Refresh Interval</label>
              <select className="form-control"><option>5 seconds</option><option>10 seconds</option><option>30 seconds</option><option>1 minute</option></select>
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="card">
          <div className="card-header"><div className="card-title"><Bell size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Alert Thresholds</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group"><label className="form-label">Temperature Warning (°C)</label><input className="form-control" type="number" defaultValue="85" /></div>
            <div className="form-group"><label className="form-label">Temperature Critical (°C)</label><input className="form-control" type="number" defaultValue="100" /></div>
            <div className="form-group"><label className="form-label">Vibration Warning (mm/s)</label><input className="form-control" type="number" defaultValue="2.5" /></div>
            <div className="form-group"><label className="form-label">Vibration Critical (mm/s)</label><input className="form-control" type="number" defaultValue="5.0" /></div>
            <div className="form-group"><label className="form-label">Health Score Warning (%)</label><input className="form-control" type="number" defaultValue="70" /></div>
            <div className="form-group"><label className="form-label">Health Score Critical (%)</label><input className="form-control" type="number" defaultValue="50" /></div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header"><div className="card-title"><Shield size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Security Settings</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-group"><label className="form-label">JWT Expiry (minutes)</label><input className="form-control" type="number" defaultValue="60" /></div>
            <div className="form-group"><label className="form-label">Session Timeout (minutes)</label><input className="form-control" type="number" defaultValue="30" /></div>
            <div className="form-group"><label className="form-label">Max Login Attempts</label><input className="form-control" type="number" defaultValue="5" /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enforce MFA for Admins</span>
              <div style={{ width: 44, height: 24, background: 'var(--accent-blue)', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Audit All API Calls</span>
              <div style={{ width: 44, height: 24, background: 'var(--accent-blue)', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud / Integrations */}
        <div className="card">
          <div className="card-header"><div className="card-title"><Cloud size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Cloud & Integrations</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'AI Engine (GPT-4o)', status: 'Connected', color: '#22c55e' },
              { name: 'RAG Vector Database', status: 'Connected', color: '#22c55e' },
              { name: 'PostgreSQL Primary', status: 'Connected', color: '#22c55e' },
              { name: 'Redis Cache', status: 'Connected', color: '#22c55e' },
              { name: 'Kubernetes Cluster', status: 'Running', color: '#22c55e' },
              { name: 'MQTT Broker (IoT)', status: 'Not Configured', color: '#6b7280' },
              { name: 'SCADA / OPC-UA', status: 'Future Phase', color: '#eab308' },
              { name: 'ERP Integration', status: 'Future Phase', color: '#eab308' },
            ].map(item => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.name}</span>
                <span style={{ fontSize: '0.75rem', color: item.color, fontWeight: 600 }}>● {item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
