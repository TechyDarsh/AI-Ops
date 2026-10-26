import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { generateProductionData } from '../data/simulator';

const production = generateProductionData();
const shiftData = [
  { shift: 'Day (06-14)', produced: 6200, target: 7000, efficiency: 88.6, operators: 8 },
  { shift: 'Evening (14-22)', produced: 5800, target: 7000, efficiency: 82.9, operators: 7 },
  { shift: 'Night (22-06)', produced: 4200, target: 6000, efficiency: 70.0, operators: 5 },
];
const hourly = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2,'0')}:00`,
  units: Math.round(400 + Math.sin(i * 0.5) * 150 + Math.random() * 80),
  rejected: Math.round(5 + Math.random() * 15),
}));

export default function ProductionPage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Production Monitoring</h1>
        <p>Daily production metrics, shift performance and efficiency tracking</p>
      </div>

      {/* KPIs */}
      <div className="grid-4 mb-md">
        {[
          { label: 'Today\'s Production', value: '14,720', unit: 'units', color: '#3b8ef3', trend: '↑ 3.2% vs yesterday' },
          { label: 'Daily Target', value: '20,000', unit: 'units', color: '#8b5cf6', trend: '73.6% achieved' },
          { label: 'Rejected Parts', value: '247', unit: 'units', color: '#ef4444', trend: '1.68% rejection rate' },
          { label: 'Line Efficiency', value: '87.4%', unit: '', color: '#22c55e', trend: '↑ 1.1% vs last week' },
        ].map(k => (
          <div key={k.label} className="card">
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>{k.unit}</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{k.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-md">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Hourly Production Today</div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b8ef3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b8ef3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Area type="monotone" dataKey="units" stroke="#3b8ef3" fill="url(#prodGrad)" name="Units/hr" dot={false} strokeWidth={2} />
                <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="none" name="Rejected" dot={false} strokeWidth={1} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Output vs Target</div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={production} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="produced" fill="#3b8ef3" name="Produced" radius={[3,3,0,0]} />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Shift Reports */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Today's Shift Reports</div>
          <span className="tag">3 Shifts</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Shift</th>
              <th>Units Produced</th>
              <th>Target</th>
              <th>Efficiency</th>
              <th>Operators</th>
              <th>Achievement</th>
            </tr>
          </thead>
          <tbody>
            {shiftData.map(s => (
              <tr key={s.shift}>
                <td><strong>{s.shift}</strong></td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{s.produced.toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)' }}>{s.target.toLocaleString()}</td>
                <td>
                  <span style={{ color: s.efficiency >= 85 ? '#22c55e' : s.efficiency >= 75 ? '#eab308' : '#ef4444', fontWeight: 700 }}>
                    {s.efficiency}%
                  </span>
                </td>
                <td>{s.operators}</td>
                <td>
                  <div className="health-bar" style={{ maxWidth: 120 }}>
                    <div className="health-fill" style={{ width: `${(s.produced/s.target)*100}%`, background: '#3b8ef3' }}></div>
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
