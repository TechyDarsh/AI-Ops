import { User, Mail, Phone, MapPin, Shield, Edit2, Key } from 'lucide-react';

export default function ProfilePage({ user }) {
  const u = user || { name: 'Admin User', email: 'admin@aiops.com', role: 'Administrator' };
  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Account settings and personal preferences</p>
      </div>

      <div className="grid-3-2">
        <div>
          <div className="card mb-md" style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0, boxShadow: 'var(--shadow-glow)' }}>
                {u.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{u.name}</h2>
                <div style={{ color: 'var(--accent-blue-lt)', fontWeight: 600, fontSize: '0.875rem', marginTop: 2 }}>{u.role}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>Industrial Corp. Ltd.</div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}><Edit2 size={12} /> Edit</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <Mail size={14}/>, label: 'Email', value: u.email },
                { icon: <Phone size={14}/>, label: 'Phone', value: '+91 98765 43210' },
                { icon: <MapPin size={14}/>, label: 'Department', value: 'Information Technology' },
                { icon: <Shield size={14}/>, label: 'Role', value: u.role },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ color: 'var(--accent-blue-lt)', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title"><Key size={14} style={{ marginRight: 6 }} />Change Password</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
              <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
              <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
              <button className="btn btn-primary" id="change-pwd-btn">Update Password</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">My Activity</div></div>
          {[
            { action: 'Logged in', time: '16:32 Today', icon: '🔐' },
            { action: 'Created Work Order WO-1007', time: '14:15 Today', icon: '📋' },
            { action: 'Viewed Analytics Dashboard', time: '13:00 Today', icon: '📊' },
            { action: 'Updated Alert Threshold', time: '11:20 Today', icon: '⚙️' },
            { action: 'Generated OEE Report', time: '09:45 Today', icon: '📄' },
            { action: 'Added Inventory Item', time: 'Yesterday 16:00', icon: '📦' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(30,45,69,0.5)' : 'none' }}>
              <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{a.action}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
