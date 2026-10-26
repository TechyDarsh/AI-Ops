import { useState, useEffect } from 'react';
import { inventoryApi } from '../services/api';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [allRes, statRes, lowRes] = await Promise.all([
      inventoryApi.getAll(),
      inventoryApi.getStats(),
      inventoryApi.getLowStock(),
    ]);
    if (allRes?.data) setItems(allRes.data);
    if (statRes?.data) setStats(statRes.data);
    if (lowRes?.data) setLowStock(lowRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    (i.category||'').toLowerCase().includes(search.toLowerCase())
  );

  const getStockLevel = (item) => {
    if (item.qtyInStock <= item.reorderPoint) return 'critical';
    if (item.qtyInStock <= item.minQty * 1.5) return 'warning';
    return 'ok';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Spare Parts Inventory</h1>
          <p>Stock management and reorder tracking — API: /api/inventory</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={12}/> Refresh</button>
          <button className="btn btn-primary btn-sm" id="add-item-btn">+ Add Item</button>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="kpi-grid mb-md">
          <div className="kpi-card" style={{'--kpi-color':'#1557a8'}}><div className="kpi-value">{stats.totalItems}</div><div className="kpi-label">Total Items</div></div>
          <div className="kpi-card" style={{'--kpi-color':'#1a7a3a'}}><div className="kpi-value">${(stats.totalValue/1000).toFixed(1)}K</div><div className="kpi-label">Total Value</div></div>
          <div className="kpi-card" style={{'--kpi-color':'#c0392b'}}><div className="kpi-value">{stats.lowStockCount}</div><div className="kpi-label">Low Stock Alerts</div></div>
          <div className="kpi-card" style={{'--kpi-color':'#6a3093'}}><div className="kpi-value">{stats.categories}</div><div className="kpi-label">Categories</div></div>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="alert alert-critical mb-md">
          <AlertTriangle size={14} />
          <div><strong>Low Stock Alert:</strong> {lowStock.map(i => i.name).join(', ')} — immediate reorder required</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Inventory Registry</span>
          <div className="filter-bar" style={{ background: 'none', border: 'none', padding: 0 }}>
            <input placeholder="Search by name, SKU, category…" value={search} onChange={e => setSearch(e.target.value)} id="inv-search"
              style={{ background: '#fff', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', width: 200 }} />
          </div>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th><th>Part Name</th><th>Category</th><th>Supplier</th>
                <th>In Stock</th><th>Min Qty</th><th>Reorder Point</th><th>Unit Cost</th>
                <th>Total Value</th><th>Level</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Loading…</td></tr>
              ) : filtered.map(item => {
                const lvl = getStockLevel(item);
                return (
                  <tr key={item.id}>
                    <td><strong className="font-mono" style={{ fontSize: '11px' }}>{item.sku}</strong></td>
                    <td><strong style={{ fontSize: '12px' }}>{item.name}</strong></td>
                    <td style={{ fontSize: '11px' }}>{item.category}</td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.supplier}</td>
                    <td>
                      <span className="font-mono font-bold" style={{ color: lvl==='critical'?'var(--status-critical)':lvl==='warning'?'var(--status-warning)':'var(--status-online)' }}>
                        {item.qtyInStock}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px' }}>{item.minQty}</td>
                    <td className="font-mono" style={{ fontSize: '11px' }}>{item.reorderPoint}</td>
                    <td className="font-mono" style={{ fontSize: '11px' }}>${item.unitCost?.toFixed(2)}</td>
                    <td className="font-mono" style={{ fontSize: '11px' }}>${(item.qtyInStock * item.unitCost).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${lvl==='critical'?'badge-critical':lvl==='warning'?'badge-warning':'badge-online'}`}>
                        {lvl === 'critical' ? 'LOW' : lvl === 'warning' ? 'WARN' : 'OK'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 3 }}>
                        <button className="btn btn-secondary btn-xs" id={`edit-${item.sku}`}>Edit</button>
                        <button className="btn btn-primary btn-xs" id={`reorder-${item.sku}`}>Reorder</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
