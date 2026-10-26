import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PolarRadiusAxis
} from 'recharts';
import { machines } from '../data/simulator';

const healthTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  avg: 75 + Math.sin(i * 0.3) * 8 + Math.random() * 5,
  critical: Math.max(0, 45 + Math.sin(i * 0.5) * 10 + Math.random() * 8),
}));

const failureFreq = [
  { machine: 'Laser Cutter', failures: 8 },
  { machine: 'Hydr. Press', failures: 5 },
  { machine: 'Pump Station', failures: 4 },
  { machine: 'CNC Mill', failures: 3 },
  { machine: 'Furnace', failures: 3 },
  { machine: 'Conveyor', failures: 2 },
];

const deptPerf = [
  { dept: 'Prod Line A', oee: 87, availability: 93, performance: 91, quality: 94 },
  { dept: 'Prod Line B', oee: 76, availability: 85, performance: 82, quality: 89 },
  { dept: 'Assembly', oee: 91, availability: 95, performance: 94, quality: 97 },
  { dept: 'Packaging', oee: 95, availability: 98, performance: 96, quality: 99 },
  { dept: 'Utilities', oee: 82, availability: 91, performance: 87, quality: 93 },
];

const powerTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  power: 250 + Math.sin(i * 0.5) * 40 + Math.random() * 20,
  cost: 18000 + Math.random() * 4000,
}));

const radarData = [
  { metric: 'OEE', A: 84 },
  { metric: 'MTBF', A: 76 },
  { metric: 'Quality', A: 93 },
  { metric: 'Availability', A: 91 },
  { metric: 'Performance', A: 88 },
  { metric: 'Safety', A: 97 },
];

export default function AnalyticsPage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Advanced Analytics</h1>
        <p>Machine health trends, failure analysis, predictive insights and department performance</p>
      </div>

      {/* KPI Summary Row */}
      <div className="grid-4 mb-md">
        {[
          { label: 'Fleet Health Index', value: '79.4%', color: '#3b8ef3', note: '↑ 2.1% vs last month' },
          { label: 'Failure Rate (MTD)', value: '2.3%', color: '#ef4444', note: '↓ 0.4% improved' },
          { label: 'Energy Efficiency', value: '88.1%', color: '#22c55e', note: '↑ 1.8% vs baseline' },
          { label: 'Predictive Accuracy', value: '94.7%', color: '#8b5cf6', note: 'AI model confidence' },
        ].map(k => (
          <div key={k.label} className="card">
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0' }}>{k.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{k.note}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2 mb-md">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Machine Health Trend (30 Days)</div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b8ef3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b8ef3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={4} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="avg" stroke="#3b8ef3" fill="url(#avgGrad)" name="Avg Health %" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical Machine" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Failure Frequency by Machine</div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureFreq} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis dataKey="machine" type="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={80} />
                <Tooltip />
                <Bar dataKey="failures" fill="#ef4444" radius={[0,4,4,0]} name="Failures" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2 mb-md">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Power Consumption Trend</div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={powerTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="power" stroke="#f97316" name="Power kW" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#eab308" name="Cost $" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Fleet Performance Radar</div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <Radar name="Fleet" dataKey="A" stroke="#3b8ef3" fill="#3b8ef3" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Department Performance Analysis</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>OEE %</th>
              <th>Availability %</th>
              <th>Performance %</th>
              <th>Quality %</th>
              <th>OEE Gauge</th>
            </tr>
          </thead>
          <tbody>
            {deptPerf.map(d => (
              <tr key={d.dept}>
                <td><strong>{d.dept}</strong></td>
                <td><span style={{ fontWeight: 800, color: d.oee>=88?'#22c55e':d.oee>=78?'#3b8ef3':'#eab308' }}>{d.oee}%</span></td>
                <td>{d.availability}%</td>
                <td>{d.performance}%</td>
                <td>{d.quality}%</td>
                <td style={{ width: 160 }}>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: `${d.oee}%`, background: d.oee>=88?'#22c55e':d.oee>=78?'#3b8ef3':'#eab308' }}></div>
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
