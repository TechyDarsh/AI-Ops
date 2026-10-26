import { useState, useEffect } from 'react';
import { FileText, Download, Eye, TrendingUp, Activity } from 'lucide-react';

const staticReports = [
  { id: 'RPT-001', name: 'Monthly OEE Report — June 2026', type: 'OEE Report', generated: '2026-07-01', size: '2.1 MB', format: 'PDF', status: 'Ready' },
  { id: 'RPT-002', name: 'Machine Health Summary — Q2 2026', type: 'Machine Report', generated: '2026-07-01', size: '3.4 MB', format: 'PDF', status: 'Ready' },
  { id: 'RPT-003', name: 'Maintenance Cost Analysis — H1 2026', type: 'Maintenance Report', generated: '2026-07-01', size: '1.8 MB', format: 'Excel', status: 'Ready' },
  { id: 'RPT-004', name: 'Asset Depreciation Report — FY2026', type: 'Asset Report', generated: '2026-06-30', size: '0.9 MB', format: 'Excel', status: 'Ready' },
  { id: 'RPT-005', name: 'Incident Analysis Report — Jun 2026', type: 'Incident Report', generated: '2026-07-01', size: '1.2 MB', format: 'PDF', status: 'Ready' },
  { id: 'RPT-006', name: 'Production Efficiency — YTD 2026', type: 'Production Report', generated: '2026-07-01', size: '4.5 MB', format: 'PDF', status: 'Ready' },
  { id: 'RPT-007', name: 'Inventory Stock Report — July 2026', type: 'Inventory Report', generated: '2026-07-06', size: '0.6 MB', format: 'Excel', status: 'Ready' },
  { id: 'RPT-008', name: 'Energy Consumption Analysis — Q2', type: 'Power Report', generated: '2026-07-01', size: '1.5 MB', format: 'PDF', status: 'Ready' },
];

const typeColors = {
  'OEE Report': '#8b5cf6', 'Machine Report': '#3b8ef3', 'Maintenance Report': '#eab308',
  'Asset Report': '#22c55e', 'Incident Report': '#ef4444', 'Production Report': '#06b6d4',
  'Inventory Report': '#f97316', 'Power Report': '#a78bfa', 'Live Sensor Report': '#00ffaa'
};

export default function ReportsPage() {
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8081');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.dht22 && data.mq2 && data.mq9) setLiveData(data);
      } catch(e) {}
    };
    return () => ws.close();
  }, []);

  const generateLivePDF = () => {
    if (!liveData) return alert('No live physical sensor data available yet! Wait for edge gateway.');
    const html = `
      <html><head><style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #111; padding: 40px; }
        h1 { color: #0f2040; border-bottom: 2px solid #00aaff; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
        th { background: #f0f4f8; color: #004488; }
        .critical { color: #d00; font-weight: bold; }
        .ok { color: #090; font-weight: bold; }
        .meta { font-size: 12px; color: #666; margin-bottom: 30px; }
      </style></head><body>
        <h1>LIVE PHYSICAL SENSORS TELEMETRY REPORT</h1>
        <div class="meta">Generated: ${new Date().toLocaleString()} | Device: ${liveData.deviceId} | Source: ${liveData.source}</div>
        <table>
          <tr><th>Machine</th><th>Sensor</th><th>Value 1</th><th>Value 2</th><th>Status</th></tr>
          <tr>
            <td>MACHINE-001 (Thermal)</td>
            <td>DHT22</td>
            <td>Temp: ${liveData.dht22.temperature}°C</td>
            <td>Hum: ${liveData.dht22.humidity}%</td>
            <td class="${liveData.dht22.temperature > 40 ? 'critical' : 'ok'}">${liveData.dht22.temperature > 40 ? 'CRITICAL' : 'NOMINAL'}</td>
          </tr>
          <tr>
            <td>MACHINE-002 (Gas A)</td>
            <td>MQ-2</td>
            <td>Raw: ${liveData.mq2.raw}</td>
            <td>Volt: ${liveData.mq2.voltage} V</td>
            <td class="${liveData.mq2.raw > 600 ? 'critical' : 'ok'}">${liveData.mq2.raw > 600 ? 'CRITICAL' : 'NOMINAL'}</td>
          </tr>
          <tr>
            <td>MACHINE-003 (Gas B)</td>
            <td>MQ-9</td>
            <td>Raw: ${liveData.mq9.raw}</td>
            <td>Volt: ${liveData.mq9.voltage} V</td>
            <td class="${liveData.mq9.raw > 600 ? 'critical' : 'ok'}">${liveData.mq9.raw > 600 ? 'CRITICAL' : 'NOMINAL'}</td>
          </tr>
        </table>
        <p style="margin-top: 40px; font-size: 10px; color: #888;">AI-Ops Industrial Intelligence Architecture - Physical Sensor Integration</p>
        <script>window.print(); setTimeout(() => window.close(), 500);</script>
      </body></html>
    `;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Reports & Export</h1>
            <p>Generate, view and export operational intelligence reports</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" id="gen-report-btn"><TrendingUp size={14} /> Generate Report</button>
            <button className="btn btn-primary" id="export-all-btn"><Download size={14} /> Export All</button>
          </div>
        </div>
      </div>

      <div className="grid-4 mb-md">
        {[
          { label: 'Total Reports', value: reports.length, color: '#3b8ef3' },
          { label: 'PDF Reports', value: reports.filter(r=>r.format==='PDF').length, color: '#ef4444' },
          { label: 'Excel Reports', value: reports.filter(r=>r.format==='Excel').length, color: '#22c55e' },
          { label: 'AI Generated', value: 4, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
        
        {/* Dynamic Live Report Card */}
        <div className="card" style={{ border: '1px solid #00ffaa44', background: 'rgba(0, 255, 170, 0.05)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#00ffaa22', color: '#00ffaa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#00ffaa', lineHeight: 1.3 }}>Live Physical Sensors Telemetry</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>ARDUINO-001 · Edge Gateway · Live</div>
            </div>
          </div>
          <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-sm)', marginTop: 'auto' }}>
            <span className="badge" style={{ background: '#00ffaa22', color: '#00ffaa' }}>Live Data</span>
            <button className="btn btn-secondary btn-sm" onClick={generateLivePDF} style={{ border: '1px solid #00ffaa' }}>
              <Download size={12} /> Generate PDF
            </button>
          </div>
        </div>

        {/* Static Reports */}
        {staticReports.map(r => (
          <div key={r.id} className="card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${typeColors[r.type]}18`, color: typeColors[r.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{r.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{r.id} · {r.size}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-md)' }}>
              <span className="tag" style={{ background: `${typeColors[r.type]}18`, color: typeColors[r.type], borderColor: `${typeColors[r.type]}30` }}>{r.type}</span>
              <span className="tag" style={{ background: r.format === 'PDF' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: r.format === 'PDF' ? '#ef4444' : '#22c55e', borderColor: 'transparent' }}>{r.format}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Generated: {r.generated}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm"><Eye size={11} /></button>
                <button className="btn btn-primary btn-sm"><Download size={11} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
