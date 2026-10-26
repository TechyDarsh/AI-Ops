import { useState } from 'react';
import { authApi } from '../services/api';
import { Lock, LogIn } from 'lucide-react';

const DEMO = [
  { email: 'admin@aiops.com', password: 'admin123', label: 'Administrator' },
  { email: 'engineer@aiops.com', password: 'eng123', label: 'Maintenance Engineer' },
  { email: 'manager@aiops.com', password: 'mgr123', label: 'Production Manager' },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@aiops.com');
  const [password, setPassword] = useState('aiops@2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res && res.token) {
        localStorage.setItem('aiops_token', res.token);
        onLogin(res);
      } else {
        setError(res?.message || 'Authentication failed. Check credentials.');
      }
    } catch (err) {
      setError('Cannot connect to AI-Ops server (localhost:8080). Ensure backend is running.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div style={{ fontSize: '2.5rem' }}>⚙️</div>
          <h1>AI-Ops Platform</h1>
          <p>Industrial Intelligence & Automation Framework v1.0</p>
          <p style={{ fontSize: '10px', color: '#4a6a8a', marginTop: 3 }}>Spring Boot Backend · JWT Authentication · H2 Database</p>
        </div>

        <div className="login-body">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address <span className="req">*</span></label>
              <input id="login-email" type="email" className="form-control" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password <span className="req">*</span></label>
              <input id="login-password" type="password" className="form-control" value={password}
                onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            {error && (
              <div className="alert alert-critical mb-sm" style={{ fontSize: '11px' }}>
                <Lock size={13} /> {error}
              </div>
            )}

            <button type="submit" id="login-submit" className="btn btn-primary w-full" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '7px', marginTop: '4px' }}>
              <LogIn size={13} /> {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <hr className="divider" />

          <div className="section-label">Quick Access — Demo Accounts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {DEMO.map(d => (
              <button key={d.email} type="button" onClick={() => { setEmail(d.email); setPassword(d.password); }}
                className="btn btn-secondary w-full" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 700, color: '#1557a8', minWidth: 150 }}>{d.label}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>{d.email}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
            🔒 JWT · RBAC · bcrypt · Spring Security · AES-256
          </div>
        </div>
      </div>
    </div>
  );
}
