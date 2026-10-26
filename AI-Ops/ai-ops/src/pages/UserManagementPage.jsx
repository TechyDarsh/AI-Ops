import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';

const users = [
  { id: 'USR-001', name: 'Admin User', email: 'admin@aiops.com', role: 'Administrator', dept: 'IT', status: 'Active', lastLogin: '2026-07-06 16:32', mfa: true },
  { id: 'USR-002', name: 'John Smith', email: 'engineer@aiops.com', role: 'Maintenance Engineer', dept: 'Maintenance', status: 'Active', lastLogin: '2026-07-06 14:15', mfa: true },
  { id: 'USR-003', name: 'Sarah Connor', email: 'manager@aiops.com', role: 'Production Manager', dept: 'Production', status: 'Active', lastLogin: '2026-07-06 08:00', mfa: false },
  { id: 'USR-004', name: 'Mike Torres', email: 'mike@aiops.com', role: 'Maintenance Engineer', dept: 'Maintenance', status: 'Active', lastLogin: '2026-07-05 22:10', mfa: true },
  { id: 'USR-005', name: 'Emily Chen', email: 'emily@aiops.com', role: 'Operator', dept: 'Production Line A', status: 'Active', lastLogin: '2026-07-06 06:00', mfa: false },
  { id: 'USR-006', name: 'Raj Patel', email: 'raj@aiops.com', role: 'Operator', dept: 'Production Line B', status: 'Inactive', lastLogin: '2026-07-01 11:30', mfa: false },
  { id: 'USR-007', name: 'Lisa Wang', email: 'lisa@aiops.com', role: 'Viewer', dept: 'Quality Control', status: 'Active', lastLogin: '2026-07-06 09:45', mfa: false },
];

const roleColors = {
  Administrator: '#ef4444', 'Maintenance Engineer': '#3b8ef3',
  'Production Manager': '#8b5cf6', Operator: '#22c55e', Viewer: '#6b7280'
};

const roleHierarchy = [
  { role: 'Administrator', permissions: ['All Access', 'User Management', 'System Config', 'Audit Logs'], level: 1 },
  { role: 'Production Manager', permissions: ['Dashboard', 'Production', 'Reports', 'Analytics'], level: 2 },
  { role: 'Maintenance Engineer', permissions: ['Machines', 'Maintenance', 'Inventory', 'Incidents'], level: 3 },
  { role: 'Operator', permissions: ['Dashboard', 'Production', 'Incidents (Create)'], level: 4 },
  { role: 'Viewer', permissions: ['Dashboard (Read-only)', 'Reports (View)'], level: 5 },
];

export default function UserManagementPage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>User Management</h1>
            <p>Manage user accounts, roles and access permissions</p>
          </div>
          <button className="btn btn-primary" id="add-user-btn">
            <Plus size={14} /> Add User
          </button>
        </div>
      </div>

      <div className="grid-4 mb-md">
        {[
          { label: 'Total Users', value: users.length, color: '#3b8ef3' },
          { label: 'Active', value: users.filter(u=>u.status==='Active').length, color: '#22c55e' },
          { label: 'MFA Enabled', value: users.filter(u=>u.mfa).length, color: '#8b5cf6' },
          { label: 'Roles', value: 5, color: '#eab308' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-3-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">User Accounts</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>MFA</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                        {u.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: '0.72rem', fontWeight: 600, color: roleColors[u.role] }}>● {u.role}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{u.dept}</td>
                  <td><span style={{ color: u.status === 'Active' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{u.status}</span></td>
                  <td>{u.mfa ? <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>✓ On</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Off</span>}</td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{u.lastLogin}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm"><Edit2 size={11} /></button>
                      <button className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-red)' }}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Role Hierarchy</div>
            <Shield size={14} style={{ color: 'var(--accent-blue-lt)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {roleHierarchy.map(r => (
              <div key={r.role} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${roleColors[r.role]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: roleColors[r.role] }}>{r.role}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>Level {r.level}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {r.permissions.map(p => (
                    <span key={p} style={{ fontSize: '0.65rem', background: 'var(--bg-card)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
