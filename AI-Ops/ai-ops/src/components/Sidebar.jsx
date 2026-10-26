import { LayoutDashboard, Monitor, Wrench, Package, BarChart2, AlertTriangle, TrendingUp, FileText, Bot, Settings, Users, ClipboardList, Bell, UserCircle, Layers, Factory } from 'lucide-react';

const NAV = [
  { group: 'Operations', items: [
    { id: 'dashboard',   label: 'Dashboard',          icon: LayoutDashboard },
    { id: 'machines',    label: 'Machine Registry',   icon: Monitor },
    { id: 'assets',      label: 'Asset Management',   icon: Layers },
    { id: 'incidents',   label: 'Incidents',          icon: AlertTriangle, badge: 2 },
  ]},
  { group: 'Maintenance', items: [
    { id: 'maintenance', label: 'Work Orders',        icon: Wrench },
    { id: 'inventory',   label: 'Spare Parts',        icon: Package },
  ]},
  { group: 'Production', items: [
    { id: 'production',  label: 'Production',         icon: BarChart2 },
    { id: 'analytics',   label: 'Analytics',          icon: TrendingUp },
  ]},
  { group: 'Intelligence', items: [
    { id: 'simulation',  label: 'Industrial Sim',     icon: Factory, badge: 'NEW', badgeColor: '#f0b429' },
    { id: 'ai',          label: 'AI Assistant',       icon: Bot },
    { id: 'documents',   label: 'Document Center',    icon: FileText },
    { id: 'reports',     label: 'Reports',            icon: ClipboardList },
  ]},
  { group: 'Administration', items: [
    { id: 'users',          label: 'User Management', icon: Users },
    { id: 'audit',          label: 'Audit Logs',      icon: ClipboardList },
    { id: 'notifications',  label: 'Notifications',   icon: Bell, badge: 4 },
    { id: 'settings',       label: 'Settings',        icon: Settings },
    { id: 'profile',        label: 'My Profile',      icon: UserCircle },
  ]},
];

export default function Sidebar({ currentPage, setPage }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⚙️</span>
        <div>
          <div className="logo-text">AI-Ops</div>
          <div className="logo-sub">Industrial Platform</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {NAV.map(group => (
          <div className="nav-group" key={group.group}>
            <div className="nav-group-title">{group.group}</div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <div key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                  id={`nav-${item.id}`}
                  style={item.id === 'simulation' ? { borderLeft: isActive ? '3px solid #f0b429' : '3px solid transparent' } : {}}>
                  <Icon size={13} />
                  {item.label}
                  {item.badge && (
                    <span className="nav-badge" style={item.badgeColor ? { background: item.badgeColor, color: '#000', fontSize: 9 } : {}}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ fontSize: '9px', color: '#4a6a8a', textAlign: 'center', marginBottom: 4 }}>
          Spring Boot 3.x · Java 22 · H2 DB
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', fontSize: '9px', color: '#4a6a8a' }}>
          <span>API: :8080</span> · <span>UI: :5174</span>
        </div>
      </div>
    </nav>
  );
}
