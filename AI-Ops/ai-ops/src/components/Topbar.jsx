import { useState, useEffect } from 'react';
import { Bell, Bot } from 'lucide-react';

const PAGE_LABELS = {
  dashboard: 'Operations Dashboard', machines: 'Machine Registry', assets: 'Asset Management',
  maintenance: 'Work Orders', inventory: 'Spare Parts Inventory', production: 'Production',
  incidents: 'Incident Management', analytics: 'Analytics', documents: 'Document Center',
  ai: 'AI Assistant', reports: 'Reports', notifications: 'Notifications',
  settings: 'Settings', users: 'User Management', audit: 'Audit Logs', profile: 'My Profile',
};

export default function Topbar({ page, user, onAiToggle }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>AI-Ops</span>
        <span className="topbar-sep">›</span>
        <span className="current">{PAGE_LABELS[page] || page}</span>
      </div>

      <div className="topbar-right">
        <span className="topbar-clock">
          {time.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: '2-digit' })}
          &nbsp;|&nbsp;{time.toLocaleTimeString('en-IN', { hour12: false })}
        </span>

        <button className="topbar-btn" aria-label="Notifications" title="Notifications" id="topbar-notifications">
          <Bell size={14} />
          <span className="badge">4</span>
        </button>

        <button className="topbar-btn" onClick={onAiToggle} aria-label="AI Assistant" title="AI Assistant" id="topbar-ai">
          <Bot size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginLeft: 4, padding: '3px 8px', background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1557a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
            {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '11.5px', color: '#fff', fontWeight: 600 }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: '10px', color: '#7a9ab8' }}>{user?.role?.replace('_', ' ') || 'Administrator'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
