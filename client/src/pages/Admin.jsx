import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, getCatEmoji } from '../components/CategoryBadge.jsx';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, DollarSign, Activity,
  ShieldAlert, Download, RefreshCw,
  Trash2, Plus, Pencil, LogOut,
  AlertTriangle, BarChart3, Target
} from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal.jsx';

const COLORS = ['#4f46e5','#db2777','#059669','#d97706','#2563eb','#ea580c','#0891b2','#7c3aed','#65a30d','#6b7280'];

export default function Admin({ onLogout }) {
  const {
    expenses, analytics, goals, recurring,
    loading, exportCSV, refetch,
    deleteExpense, deleteGoal, deleteRecurring
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const avgTransaction = expenses.length ? Math.round(totalSpent / expenses.length) : 0;
  const overBudgetCats = analytics?.categoryStatus?.filter(c => c.percentUsed > 100) || [];

  const pieData = analytics?.byCategory
    ? Object.entries(analytics.byCategory).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
    : [];

  const barData = (analytics?.categoryStatus || [])
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6)
    .map(c => ({ name: c.category.slice(0, 6), spent: c.spent, budget: c.budget }));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'expenses', label: 'Expenses (' + expenses.length + ')' },
    { id: 'goals', label: 'Goals (' + goals.length + ')' },
    { id: 'recurring', label: 'Recurring (' + recurring.length + ')' },
  ];

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div>
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(219,39,119,0.04))',
        border: '1px solid rgba(79,70,229,0.15)',
        borderRadius: 12, padding: '16px 22px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Admin Control Panel</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full access · Manage all data</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={refetch}><RefreshCw size={13} /> Refresh</button>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Download size={13} /> Export CSV</button>
          <button className="btn btn-danger btn-sm" onClick={onLogout}><LogOut size={13} /> Logout</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Activity, label: 'Total Transactions', value: expenses.length, sub: 'All records', color: 'var(--accent)', bg: 'rgba(79,70,229,0.1)' },
          { icon: DollarSign, label: 'Total Spent', value: formatINR(totalSpent), sub: (analytics?.percentUsed || 0) + '% of budget', color: 'var(--red)', bg: 'var(--red-dim)' },
          { icon: TrendingUp, label: 'Avg Transaction', value: formatINR(avgTransaction), sub: new Set(expenses.map(e => e.category)).size + ' categories', color: 'var(--green)', bg: 'var(--green-dim)' },
          { icon: AlertTriangle, label: 'Over Budget', value: overBudgetCats.length, sub: overBudgetCats.length > 0 ? overBudgetCats.map(c => c.category).join(', ') : 'All within limits', color: overBudgetCats.length > 0 ? 'var(--red)' : 'var(--green)', bg: overBudgetCats.length > 0 ? 'var(--red-dim)' : 'var(--green-dim)' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{k.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={16} color={k.color} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: activeTab === t.id ? 'white' : 'transparent',
            color: activeTab === t.id ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: activeTab === t.id ? 'var(--shadow)' : 'none',
            transition: 'all 0.15s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
            <div className="chart-card">
              <div className="chart-header">
                <div><div className="chart-title">Spent vs Budget by Category</div><div className="chart-subtitle">Top spending categories</div></div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v) => formatINR(v)} />
                  <Bar dataKey="budget" fill="var(--bg-elevated)" radius={[4,4,0,0]} name="Budget" stroke="var(--border)" strokeWidth={1} />
                  <Bar dataKey="spent" fill="var(--accent)" radius={[4,4,0,0]} name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">Spend Distribution</div></div>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {pieData.slice(0, 5).map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                        <span style={{ color: 'var(--text-muted)', flex: 1 }}>{d.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatINR(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="empty-state"><div className="empty-text">No data</div></div>}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} color="var(--accent)" /> Budget Status by Category
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Budget</th>
                    <th style={{ textAlign: 'right' }}>Spent</th>
                    <th style={{ textAlign: 'right' }}>Remaining</th>
                    <th style={{ width: 160 }}>Progress</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.categoryStatus || []).filter(c => c.spent > 0 || c.budget > 0).sort((a, b) => b.spent - a.spent).map((c, i) => {
                    const isOver = c.percentUsed > 100;
                    const isNear = c.percentUsed > 80 && !isOver;
                    return (
                      <tr key={c.category}>
                        <td><span style={{ fontSize: 14 }}>{getCatEmoji(c.category)}</span> <strong>{c.category}</strong></td>
                        <td style={{ textAlign: 'right' }}>{formatINR(c.budget)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--red)', fontWeight: 600 }}>{formatINR(c.spent)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: c.remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>{c.remaining >= 0 ? '+' : ''}{formatINR(c.remaining)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div className="progress-fill" style={{ width: Math.min(c.percentUsed, 100) + '%', background: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)' }} />
                            </div>
                            <span style={{ fontSize: 11, width: 32, textAlign: 'right', color: 'var(--text-muted)' }}>{c.percentUsed}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: isOver ? 'var(--red-dim)' : isNear ? 'var(--amber-dim)' : 'var(--green-dim)', color: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)' }}>
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
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>All Expenses</div>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditExpense(null); setShowExpenseModal(true); }}><Plus size={14} /> Add Expense</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th>Tags</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center' }}>Actions</th></tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-text">No expenses</div></div></td></tr>
                ) : [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: 500 }}>{exp.description || '—'}</td>
                    <td>{getCatEmoji(exp.category)} {exp.category}</td>
                    <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(exp.tags || []).map(t => <span key={t} className="chip">{t}</span>)}</div></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--red)' }}>−{formatINR(exp.amount)}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditExpense(exp); setShowExpenseModal(true); }}><Pencil size={13} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setConfirmDelete({ type: 'expense', id: exp.id, label: exp.description || exp.category })}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {goals.length === 0 ? (
            <div className="card" style={{ padding: 40 }}><div className="empty-state"><div className="empty-text">No goals set</div></div></div>
          ) : goals.map(goal => {
            const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            return (
              <div key={goal.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: goal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={18} color={goal.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{goal.name}</div>
                      {goal.deadline && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => setConfirmDelete({ type: 'goal', id: goal.id, label: goal.name })}><Trash2 size={13} /></button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: goal.color }}>{pct}%</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatINR(goal.current)} / {formatINR(goal.target)}</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: pct + '%', background: goal.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recurring Tab */}
      {activeTab === 'recurring' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Recurring Expenses</div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>Frequency</th><th>Next Due</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center' }}>Actions</th></tr>
              </thead>
              <tbody>
                {recurring.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-text">No recurring expenses</div></div></td></tr>
                ) : recurring.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{getCatEmoji(r.category)} {r.category}</td>
                    <td><span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: 'rgba(79,70,229,0.08)', color: 'var(--accent)' }}>{r.frequency}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.nextDue ? new Date(r.nextDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--red)' }}>{formatINR(r.amount)}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setConfirmDelete({ type: 'recurring', id: r.id, label: r.name })}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showExpenseModal && <ExpenseModal expense={editExpense} onClose={() => { setShowExpenseModal(false); setEditExpense(null); }} />}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Confirm Delete</h2></div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>"{confirmDelete.label}"</strong>?</p>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={async () => {
                if (confirmDelete.type === 'expense') await deleteExpense(confirmDelete.id);
                else if (confirmDelete.type === 'goal') await deleteGoal(confirmDelete.id);
                else if (confirmDelete.type === 'recurring') await deleteRecurring(confirmDelete.id);
                setConfirmDelete(null);
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
