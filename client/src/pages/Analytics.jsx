import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, getCatEmoji } from '../components/CategoryBadge.jsx';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#7c6ef0','#f472b6','#34d399','#fbbf24','#60a5fa','#fb923c','#22d3ee','#a78bfa','#a3e635','#94a3b8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: p.color, fontSize: 12 }}>{p.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text)' }}>{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { analytics, summary, loading } = useApp();

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading analytics...</span></div>;
  if (!analytics) return null;

  const { topCategories, categoryStatus, weeklyTrend, dailyTrend, byCategory } = analytics;

  const pieData = Object.entries(byCategory || {}).map(([name, value], i) => ({
    name, value, color: COLORS[i % COLORS.length]
  }));

  // Radar data for category spending vs budget
  const radarData = (categoryStatus || []).slice(0, 7).map(c => ({
    category: c.category.slice(0, 5),
    spent: Math.round((c.spent / (c.budget || 1)) * 100),
    fullMark: 150
  }));

  // Efficiency score
  const efficiency = analytics.percentUsed <= 100
    ? Math.round(100 - (analytics.percentUsed * 0.5))
    : Math.max(0, Math.round(50 - (analytics.percentUsed - 100)));

  const efficiencyColor = efficiency > 70 ? 'var(--green)' : efficiency > 40 ? 'var(--amber)' : 'var(--red)';

  return (
    <div>
      {/* Top KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Budget Efficiency', value: `${efficiency}%`, color: efficiencyColor, sub: efficiency > 70 ? 'Excellent' : efficiency > 40 ? 'Fair' : 'Over Budget' },
          { label: 'Avg Transaction', value: formatINR(analytics.transactionCount ? analytics.totalExpenses / analytics.transactionCount : 0), color: 'var(--accent)', sub: `${analytics.transactionCount} total transactions` },
          { label: 'Daily Avg Spend', value: formatINR(analytics.avgDaily), color: 'var(--amber)', sub: 'Per day this month' },
          { label: 'Top Category', value: topCategories?.[0]?.category || '—', color: 'var(--pink)', sub: topCategories?.[0] ? formatINR(topCategories[0].amount) : '—' },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{kpi.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: kpi.color, marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Weekly Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Weekly Spending Breakdown</div>
              <div className="chart-subtitle">How your spending is distributed across weeks</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyTrend} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Spent" radius={[8, 8, 0, 0]}>
                {weeklyTrend?.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Spending Split</div>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload[0] ? (
                    <div className="tooltip-custom">
                      <span style={{ color: payload[0].payload.color, fontWeight: 700 }}>{payload[0].name}</span>
                      <br />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(payload[0].value)}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({payload[0].payload.percent || Math.round(payload[0].value / analytics.totalExpenses * 100)}%)</span>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {pieData.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)', flex: 1 }}>{d.name}</span>
                    <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 11 }}>{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-text">No data</div></div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Radar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Budget Utilization Radar</div>
              <div className="chart-subtitle">% of budget used per category</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }} />
              <Radar name="Budget Used %" dataKey="spent" stroke="#7c6ef0" fill="#7c6ef0" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip content={({ active, payload }) => active && payload[0] ? (
                <div className="tooltip-custom">{payload[0].payload.category}: {payload[0].value}% of budget</div>
              ) : null} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">6-Month Trend</div>
              <div className="chart-subtitle">Historical spending comparison</div>
            </div>
          </div>
          {summary?.last6Months ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={summary.last6Months}>
                <defs>
                  <linearGradient id="grad6m" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Total Spent" stroke="#34d399" strokeWidth={2.5} fill="url(#grad6m)" dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">Category Performance Report</div>
            <div className="chart-subtitle">Detailed breakdown of spending vs budget by category</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Spent</th>
                <th style={{ textAlign: 'right' }}>Budget</th>
                <th style={{ textAlign: 'right' }}>Remaining</th>
                <th style={{ width: 180 }}>Progress</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(categoryStatus || []).filter(c => c.spent > 0 || c.budget > 0).sort((a, b) => b.spent - a.spent).map((c, i) => {
                const isOver = c.percentUsed > 100;
                const isNear = c.percentUsed > 80 && !isOver;
                return (
                  <tr key={c.category}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{getCatEmoji(c.category)}</span>
                        <span style={{ fontWeight: 600 }}>{c.category}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--red)' }}>
                      {formatINR(c.spent)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {formatINR(c.budget)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: c.remaining >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {c.remaining >= 0 ? '+' : ''}{formatINR(c.remaining)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{
                            width: `${Math.min(c.percentUsed, 100)}%`,
                            background: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : COLORS[i % COLORS.length]
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: 35, textAlign: 'right' }}>
                          {c.percentUsed}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: isOver ? 'var(--red-dim)' : isNear ? 'var(--amber-dim)' : 'var(--green-dim)',
                        color: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)'
                      }}>
                        {isOver ? '⚠ Over' : isNear ? '↑ Near' : '✓ OK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Trend full width */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Daily Spending Pattern</div>
            <div className="chart-subtitle">Full month day-by-day expenditure</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyTrend}>
            <defs>
              <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={d => new Date(d).getDate()} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" name="Daily Spent" stroke="#f472b6" strokeWidth={2} fill="url(#dailyGrad)" dot={false} activeDot={{ r: 5, fill: '#f472b6' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
