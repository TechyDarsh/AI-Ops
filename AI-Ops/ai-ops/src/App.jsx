import { useState } from 'react';
import { lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AiAssistantPanel from './components/AiAssistantPanel';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MachinesPage from './pages/MachinesPage';
import MaintenancePage from './pages/MaintenancePage';
import InventoryPage from './pages/InventoryPage';
import ProductionPage from './pages/ProductionPage';
import IncidentsPage from './pages/IncidentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssetsPage from './pages/AssetsPage';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProfilePage from './pages/ProfilePage';

// Lazy-load the heavy 3D simulation page
const SimulationPage = lazy(() => import('./pages/SimulationPage'));

function AppShell({ children, page, setPage, user }) {
  const [aiOpen, setAiOpen] = useState(false);
  const isSimulation = page === 'simulation';

  return (
    <div className="app-layout">
      <Sidebar currentPage={page} setPage={setPage} />
      <div className="main-content">
        <Topbar page={page} user={user} onAiToggle={() => setAiOpen(o => !o)} />
        {/* Simulation page gets NO padding wrapper — it handles its own fullscreen layout */}
        {isSimulation ? children : (
          <div className="page-content">
            {children}
          </div>
        )}
      </div>
      {/* Don't show AI floating button on simulation page — it has its own */}
      {!isSimulation && (
        <>
          {aiOpen && <AiAssistantPanel onClose={() => setAiOpen(false)} />}
          {!aiOpen && (
            <button className="ai-fab" onClick={() => setAiOpen(true)} title="AI Assistant" aria-label="AI Assistant">
              🤖
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aiops_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [page, setPage] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('aiops_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('aiops_token');
    localStorage.removeItem('aiops_user');
    setUser(null);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':     return <DashboardPage />;
      case 'machines':      return <MachinesPage />;
      case 'assets':        return <AssetsPage />;
      case 'maintenance':   return <MaintenancePage />;
      case 'inventory':     return <InventoryPage />;
      case 'production':    return <ProductionPage />;
      case 'incidents':     return <IncidentsPage />;
      case 'analytics':     return <AnalyticsPage />;
      case 'documents':     return <DocumentsPage />;
      case 'ai':            return <AiAssistantPage />;
      case 'reports':       return <ReportsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'settings':      return <SettingsPage />;
      case 'users':         return <UserManagementPage />;
      case 'audit':         return <AuditLogsPage />;
      case 'profile':       return <ProfilePage user={user} onLogout={handleLogout} />;
      case 'simulation':
        return (
          <Suspense fallback={
            <div style={{ flex: 1, background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: '#00aaff', fontFamily: '"Roboto Mono",monospace' }}>
              <div style={{ fontSize: 40 }}>⚙️</div>
              <div style={{ fontSize: 14 }}>Loading 3D Factory Simulation…</div>
              <div style={{ fontSize: 11, color: '#2a4a6a' }}>Initializing Three.js · Loading assets</div>
            </div>
          }>
            <SimulationPage />
          </Suspense>
        );
      default: return <DashboardPage />;
    }
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <AppShell page={page} setPage={setPage} user={user}>
      {renderPage()}
    </AppShell>
  );
}
