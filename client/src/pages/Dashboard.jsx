import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../components/CategoryBadge.jsx';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight, AlertTriangle } from 'lucide-react';

const COLORS = ['#7c6ef0','#f472b6','#34d399','#fbbf24','#60a5fa','#fb923c','#22d3ee','#a78bfa','#a3e635','#94a3b8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{formatINR(p.value)}</div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { analytics, summary, goals, loading, setActivePage } = useApp();

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading your finances...</span></div>;
  if (!analytics) return null;

  const { totalExpenses, totalBudget, remaining, percentUsed, byCategory, topCategories, dailyTrend, categoryStatus } = analytics;

  const pieData = Object.entries(byCategory || {}).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  const barData = Array.isArray(categoryStatus)? categoryStatus.slice(0, 6).map(c => ({name: c.category.slice(0, 5),spent: c.spent,budget: c.budget})): [];
  const alerts = categoryStatus?.filter(c => c.percentUsed > 90) || [];

  return (
    <div>
      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <AlertTriangle size={18} color="var(--amber)" />
          <span style={{ fontSize: 14, color: 'var(--amber)' }}>
            <strong>{alerts.length} category{alerts.length > 1 ? 's' : ''}</strong> near or over budget —{' '}
            {alerts.map(a => a.category).join(', ')}
          </span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setActivePage('budget')}>
            View Budget
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-icon" style={{ background: 'rgba(124,110,240,0.15)', color: 'var(--accent)' }}>
            <Wallet size={18} />
          </div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{formatINR(totalExpenses)}</div>
          <div className="stat-meta">{percentUsed}% of monthly budget</div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className="progress-fill" style={{
              width: `${Math.min(percentUsed, 100)}%`,
              background: percentUsed > 90 ? 'var(--red)' : percentUsed > 70 ? 'var(--amber)' : 'var(--accent)'
            }} />
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            <TrendingUp size={18} />
          </div>
          <div className="stat-label">Remaining Budget</div>
          <div className="stat-value" style={{ color: remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {formatINR(Math.abs(remaining))}
          </div>
          <div className="stat-meta" style={{ color: remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {remaining >= 0 ? '✓ Within budget' : '⚠ Over budget'}
          </div>
        </div>

        <div className="stat-card amber">
          <div className="stat-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
            <Target size={18} />
          </div>
          <div className="stat-label">Monthly Budget</div>
          <div className="stat-value">{formatINR(totalBudget)}</div>
          <div className="stat-meta">{analytics.transactionCount} transactions</div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
            <TrendingDown size={18} />
          </div>
          <div className="stat-label">Daily Average</div>
          <div className="stat-value">{formatINR(analytics.avgDaily)}</div>
          <div className="stat-meta">Per day this month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Daily Spending Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Daily Spending Trend</div>
              <div className="chart-subtitle">Your spending pattern over the month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6ef0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6ef0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                tickFormatter={d => new Date(d).getDate()} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#7c6ef0" strokeWidth={2.5}
                fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: '#7c6ef0' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">By Category</div>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload[0] ? (
                    <div className="tooltip-custom">
                      <div style={{ color: payload[0].payload.color, fontWeight: 700 }}>{payload[0].name}</div>
                      <div>{formatINR(payload[0].value)}</div>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)', flex: 1 }}>{d.name}</span>
                    <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-text">No data for this period</div></div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Budget vs Spent */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Budget vs Spent</div>
              <div className="chart-subtitle">By top categories</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" fill="rgba(255,255,255,0.06)" radius={[4,4,0,0]} name="Budget" />
              <Bar dataKey="spent" fill="var(--accent)" radius={[4,4,0,0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6-Month Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">6-Month Overview</div>
              <div className="chart-subtitle">Historical spending trend</div>
            </div>
          </div>
          {summary?.last6Months ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={summary.last6Months}>
                <defs>
                  <linearGradient id="sixGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#f472b6" strokeWidth={2.5}
                  fill="url(#sixGrad)" dot={false} activeDot={{ r: 5, fill: '#f472b6' }} name="Total" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>

      {/* Savings Goals Quick View */}
      {goals.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Savings Goals</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setActivePage('goals')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {goals.slice(0, 3).map(goal => {
              const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
              return (
                <div key={goal.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{goal.name}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: goal.color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: goal.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{formatINR(goal.current)}</span>
                    <span>{formatINR(goal.target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
