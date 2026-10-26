import { Search, Upload, Download, FileText, File, BookOpen, ClipboardList } from 'lucide-react';
import { useState } from 'react';

const documents = [
  { id: 'DOC-001', name: 'CNC Mill Alpha — Operation Manual', type: 'Manual', machine: 'MCH-001', size: '4.2 MB', version: 'v3.1', uploaded: '2024-01-15', category: 'Machine Manual', format: 'PDF' },
  { id: 'DOC-002', name: 'Hydraulic Press Maintenance SOP', type: 'SOP', machine: 'MCH-002', size: '1.8 MB', version: 'v2.0', uploaded: '2024-03-22', category: 'Maintenance SOP', format: 'PDF' },
  { id: 'DOC-003', name: 'Robot Arm Safety & Operation Guide', type: 'Manual', machine: 'MCH-003', size: '6.1 MB', version: 'v4.2', uploaded: '2024-02-10', category: 'Machine Manual', format: 'PDF' },
  { id: 'DOC-004', name: 'Laser Cutter Calibration Procedure', type: 'SOP', machine: 'MCH-006', size: '0.9 MB', version: 'v1.5', uploaded: '2024-04-05', category: 'Maintenance SOP', format: 'PDF' },
  { id: 'DOC-005', name: 'Q2 2026 Maintenance Report', type: 'Report', machine: 'All', size: '2.3 MB', version: 'v1.0', uploaded: '2026-07-01', category: 'Maintenance Report', format: 'PDF' },
  { id: 'DOC-006', name: 'Factory Floor Engineering Drawing Rev.5', type: 'Drawing', machine: 'All', size: '12.4 MB', version: 'v5.0', uploaded: '2023-08-20', category: 'Engineering Drawing', format: 'DWG' },
  { id: 'DOC-007', name: 'Electrical Safety Inspection Report Jun-2026', type: 'Report', machine: 'All', size: '1.1 MB', version: 'v1.0', uploaded: '2026-06-30', category: 'Inspection Report', format: 'PDF' },
  { id: 'DOC-008', name: 'Vibration Analysis Standard — IEC 60068-2', type: 'Standard', machine: 'All', size: '3.7 MB', version: 'v2024', uploaded: '2024-01-01', category: 'Engineering Standard', format: 'PDF' },
  { id: 'DOC-009', name: 'Furnace Temperature Control Manual', type: 'Manual', machine: 'MCH-008', size: '2.9 MB', version: 'v2.3', uploaded: '2023-11-12', category: 'Machine Manual', format: 'PDF' },
  { id: 'DOC-010', name: 'Emergency Shutdown Procedures SOP-ES-001', type: 'SOP', machine: 'All', size: '0.7 MB', version: 'v3.0', uploaded: '2025-01-15', category: 'Safety SOP', format: 'PDF' },
];

const typeIcons = { Manual: <BookOpen size={15} color="#3b8ef3" />, SOP: <ClipboardList size={15} color="#22c55e" />, Report: <FileText size={15} color="#eab308" />, Drawing: <File size={15} color="#8b5cf6" />, Standard: <FileText size={15} color="#06b6d4" /> };

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  const categories = ['All', 'Machine Manual', 'Maintenance SOP', 'Maintenance Report', 'Inspection Report', 'Engineering Drawing', 'Safety SOP', 'Engineering Standard'];
  const filtered = documents.filter(d =>
    (cat === 'All' || d.category === cat) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Document Center</h1>
            <p>Manuals, SOPs, reports and engineering drawings — RAG indexed</p>
          </div>
          <button className="btn btn-primary" id="upload-doc-btn">
            <Upload size={14} /> Upload Document
          </button>
        </div>
      </div>

      <div className="grid-4 mb-md">
        {[
          { label: 'Total Documents', value: documents.length, color: '#3b8ef3', icon: '📄' },
          { label: 'Machine Manuals', value: documents.filter(d=>d.type==='Manual').length, color: '#8b5cf6', icon: '📖' },
          { label: 'SOPs', value: documents.filter(d=>d.type==='SOP').length, color: '#22c55e', icon: '📋' },
          { label: 'RAG Indexed', value: documents.length, color: '#06b6d4', icon: '🔍' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-md" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} id="doc-search" />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.slice(0,6).map(c => (
              <button key={c} onClick={() => setCat(c)} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.72rem' }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
        {filtered.map(doc => (
          <div key={doc.id} className="card glow-border" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                {typeIcons[doc.type] || <FileText size={15} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{doc.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{doc.id} · {doc.format}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <span className="tag">{doc.category}</span>
              <span className="tag" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', borderColor: 'rgba(34,197,94,0.2)' }}>RAG ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <span>{doc.size} · {doc.version}</span>
              <span>{doc.uploaded}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>View</button>
              <button className="btn btn-secondary btn-sm"><Download size={11} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
