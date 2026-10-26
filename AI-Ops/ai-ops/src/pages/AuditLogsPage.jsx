export default function AuditLogsPage() {
  const logs = [
    { id: 'AUD-10048', user: 'Admin User', action: 'USER_LOGIN', resource: 'Authentication', detail: 'Successful login from IP 192.168.1.10', time: '2026-07-06 16:32:14', severity: 'Info' },
    { id: 'AUD-10047', user: 'John Smith', action: 'WORK_ORDER_CREATE', resource: 'Maintenance', detail: 'Created WO-1007 for MCH-006 (Critical Priority)', time: '2026-07-06 16:15:00', severity: 'Info' },
    { id: 'AUD-10046', user: 'System AI', action: 'ALERT_TRIGGERED', resource: 'MCH-006', detail: 'Critical vibration threshold exceeded — auto alert generated', time: '2026-07-06 15:58:22', severity: 'Critical' },
    { id: 'AUD-10045', user: 'Sarah Connor', action: 'REPORT_GENERATED', resource: 'Reports', detail: 'Generated Monthly OEE Report for June 2026', time: '2026-07-06 14:30:11', severity: 'Info' },
    { id: 'AUD-10044', user: 'Mike Torres', action: 'INVENTORY_UPDATE', resource: 'Inventory', detail: 'Updated stock count for SKF Bearing 6205 (48 units)', time: '2026-07-06 13:45:00', severity: 'Info' },
    { id: 'AUD-10043', user: 'Admin User', action: 'USER_CREATED', resource: 'User Management', detail: 'Created new operator account emily@aiops.com', time: '2026-07-06 11:20:05', severity: 'Warning' },
    { id: 'AUD-10042', user: 'System', action: 'MACHINE_OFFLINE', resource: 'MCH-008', detail: 'Furnace Theta taken offline for scheduled maintenance', time: '2026-07-06 08:05:33', severity: 'Info' },
    { id: 'AUD-10041', user: 'Emily Chen', action: 'INCIDENT_CREATED', resource: 'Incidents', detail: 'Reported incident INC-2024007 — Pump Station vibration', time: '2026-07-06 07:48:12', severity: 'Warning' },
    { id: 'AUD-10040', user: 'John Smith', action: 'WORK_ORDER_COMPLETE', resource: 'Maintenance', detail: 'Completed WO-1001 — Preventive maintenance CNC Mill Alpha', time: '2026-07-05 22:30:00', severity: 'Info' },
    { id: 'AUD-10039', user: 'Admin User', action: 'SETTINGS_CHANGED', resource: 'System Config', detail: 'Updated alert threshold for vibration to 2.5 mm/s', time: '2026-07-05 17:00:00', severity: 'Warning' },
  ];

  const severityColors = { Info: '#3b8ef3', Warning: '#eab308', Critical: '#ef4444', Error: '#ef4444' };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Complete system activity trail — all actions are logged and immutable</p>
      </div>

      <div className="grid-4 mb-md">
        {[
          { label: 'Total Events (24h)', value: logs.length, color: '#3b8ef3' },
          { label: 'Critical Events', value: logs.filter(l=>l.severity==='Critical').length, color: '#ef4444' },
          { label: 'Warning Events', value: logs.filter(l=>l.severity==='Warning').length, color: '#eab308' },
          { label: 'System Events', value: logs.filter(l=>l.user==='System'||l.user==='System AI').length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Detail</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{log.id}</strong></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.time}</td>
                <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{log.user}</td>
                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: 'rgba(30,111,217,0.1)', color: 'var(--accent-blue-lt)', padding: '2px 6px', borderRadius: 4 }}>{log.action}</span></td>
                <td><span className="tag">{log.resource}</span></td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 320 }}>{log.detail}</td>
                <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: severityColors[log.severity] }}>● {log.severity}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
