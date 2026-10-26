import { Bell, AlertTriangle, Wrench, Cpu, Package, CheckCircle } from 'lucide-react';

const notifications = [
  { id: 1, type: 'critical', icon: <AlertTriangle size={16} />, title: 'CRITICAL: Laser Cutter Zeta — Failure Risk', message: 'Vibration levels 340% above threshold. Immediate inspection required.', time: '2 min ago', read: false },
  { id: 2, type: 'warning', icon: <Wrench size={16} />, title: 'Maintenance Due: Hydraulic Press Beta', message: 'Work Order WO-1007 is overdue by 3 days. Assign technician immediately.', time: '15 min ago', read: false },
  { id: 3, type: 'info', icon: <Package size={16} />, title: 'Low Stock Alert: Hydraulic Pump P100', message: 'Current stock: 3 units. Reorder point: 3. Submit purchase request.', time: '1 hr ago', read: false },
  { id: 4, type: 'warning', icon: <AlertTriangle size={16} />, title: 'Maintenance Due: Pump Station Mu', message: 'Bearing vibration analysis suggests replacement within 7 days.', time: '2 hrs ago', read: false },
  { id: 5, type: 'info', icon: <Cpu size={16} />, title: 'Machine MCH-008 Under Maintenance', message: 'Furnace Theta maintenance started at 08:00. ETA: 14:30 today.', time: '3 hrs ago', read: true },
  { id: 6, type: 'success', icon: <CheckCircle size={16} />, title: 'Work Order Completed: WO-1001', message: 'Preventive maintenance on CNC Mill Alpha completed successfully.', time: '4 hrs ago', read: true },
  { id: 7, type: 'info', icon: <Bell size={16} />, title: 'AI Report Generated', message: 'Monthly OEE Analysis Report for June 2026 is ready for download.', time: '5 hrs ago', read: true },
];

const typeColors = { critical: '#ef4444', warning: '#eab308', info: '#3b8ef3', success: '#22c55e' };

export default function NotificationsPage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Notifications</h1>
            <p>Alerts, maintenance reminders and system notifications</p>
          </div>
          <button className="btn btn-secondary" id="mark-all-read-btn">Mark All as Read</button>
        </div>
      </div>

      <div className="grid-4 mb-md">
        {[
          { label: 'Total', value: notifications.length, color: '#3b8ef3' },
          { label: 'Critical', value: notifications.filter(n=>n.type==='critical').length, color: '#ef4444' },
          { label: 'Unread', value: notifications.filter(n=>!n.read).length, color: '#eab308' },
          { label: 'Today', value: notifications.length, color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {notifications.map((n, idx) => (
          <div key={n.id} style={{
            display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)',
            borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
            background: !n.read ? `${typeColors[n.type]}06` : 'transparent',
            alignItems: 'flex-start',
            transition: 'var(--transition)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${typeColors[n.type]}15`, color: typeColors[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {n.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</span>
                {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: typeColors[n.type], flexShrink: 0 }}></span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 4 }}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
