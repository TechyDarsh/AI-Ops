import { machines } from '../data/simulator';
import { Plus, QrCode, MapPin, DollarSign, Calendar } from 'lucide-react';

const assets = [
  { id: 'AST-001', name: 'Industrial Forklift #1', category: 'Material Handling', dept: 'Warehouse', status: 'Active', value: 45000, purchaseDate: '2021-03-10', lifespan: 10, assignedTo: 'Warehouse Team', location: 'Bay A', depreciation: '15% PA' },
  { id: 'AST-002', name: 'UPS System 60kVA', category: 'Power Infrastructure', dept: 'Utilities', status: 'Active', value: 28000, purchaseDate: '2020-07-15', lifespan: 15, assignedTo: 'Electrical Team', location: 'Server Room', depreciation: '10% PA' },
  { id: 'AST-003', name: 'HVAC Cooling Unit', category: 'Infrastructure', dept: 'Facilities', status: 'Active', value: 32000, purchaseDate: '2019-11-20', lifespan: 20, assignedTo: 'Facilities', location: 'Roof Level 2', depreciation: '8% PA' },
  { id: 'AST-004', name: 'Overhead Crane 10T', category: 'Material Handling', dept: 'Production Line A', status: 'Active', value: 95000, purchaseDate: '2018-06-01', lifespan: 25, assignedTo: 'Crane Operator Team', location: 'Bay 1-3', depreciation: '6% PA' },
  { id: 'AST-005', name: 'Safety Camera System', category: 'Security', dept: 'Security', status: 'Active', value: 18000, purchaseDate: '2022-02-14', lifespan: 8, assignedTo: 'Security Team', location: 'All Floors', depreciation: '20% PA' },
  { id: 'AST-006', name: 'Diesel Generator 500kVA', category: 'Power Infrastructure', dept: 'Utilities', status: 'Standby', value: 75000, purchaseDate: '2020-09-30', lifespan: 20, assignedTo: 'Utilities Team', location: 'Generator Room', depreciation: '8% PA' },
];

export default function AssetsPage() {
  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Asset Management</h1>
            <p>Track, manage and monitor all {assets.length + machines.length} company assets</p>
          </div>
          <button className="btn btn-primary" id="add-asset-btn">
            <Plus size={14} /> Register Asset
          </button>
        </div>
      </div>

      <div className="grid-4 mb-md">
        {[
          { label: 'Total Assets', value: assets.length + machines.length, color: '#3b8ef3', icon: '🏭' },
          { label: 'Total Asset Value', value: `$${((totalValue + 1800000) / 1000000).toFixed(1)}M`, color: '#22c55e', icon: '💰' },
          { label: 'Active Assets', value: assets.length + 8, color: '#8b5cf6', icon: '✅' },
          { label: 'Depreciation (YTD)', value: '$48.2K', color: '#eab308', icon: '📉' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Asset Registry</div>
          <span className="tag">{assets.length} Non-Machine Assets</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Department</th>
              <th>Status</th>
              <th>Purchase Value</th>
              <th>Purchase Date</th>
              <th>Lifespan</th>
              <th>Depreciation</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id}>
                <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{a.id}</strong></td>
                <td><strong>{a.name}</strong></td>
                <td><span className="tag">{a.category}</span></td>
                <td>{a.dept}</td>
                <td><span style={{ color: a.status === 'Active' ? 'var(--accent-green)' : 'var(--accent-yellow)', fontWeight: 600, fontSize: '0.8rem' }}>● {a.status}</span></td>
                <td style={{ color: 'var(--accent-green)', fontWeight: 700 }}>${a.value.toLocaleString()}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.purchaseDate}</td>
                <td style={{ fontSize: '0.8rem' }}>{a.lifespan} yrs</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--accent-red)' }}>{a.depreciation}</td>
                <td style={{ fontSize: '0.8rem' }}><MapPin size={11} style={{ marginRight: 3 }} />{a.location}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-secondary btn-sm"><QrCode size={11} /></button>
                    <button className="btn btn-secondary btn-sm">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
