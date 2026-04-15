import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, formatDate } from '../components/CategoryBadge.jsx';
import { Plus, Trash2, Pencil, Target, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1','#f59e0b','#10b981','#f472b6','#60a5fa','#fb923c','#a78bfa','#22d3ee'];

function GoalModal({ goal, onClose }) {
  const { addGoal, updateGoal } = useApp();
  const [form, setForm] = useState(goal || { name: '', target: '', current: '', deadline: '', color: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = goal ? await updateGoal(goal._id, { ...form, target: parseFloat(form.target), current: parseFloat(form.current) })
      : await addGoal({ ...form, target: parseFloat(form.target), current: parseFloat(form.current) });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{goal ? 'Edit Goal' : 'New Savings Goal'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Emergency Fund" required />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Target Amount (₹) *</label>
              <input className="form-input" type="number" value={form.target} onChange={e => set('target', e.target.value)} placeholder="100000" required />
            </div>
            <div className="form-group">
              <label className="form-label">Current Savings (₹)</label>
              <input className="form-input" type="number" value={form.current} onChange={e => set('current', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Deadline</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => set('color', c)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? `3px solid white` : '3px solid transparent',
                  outline: form.color === c ? `2px solid ${c}` : 'none',
                  transition: 'all 0.15s'
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContributeModal({ goal, onClose }) {
  const { updateGoal } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateGoal(goal._id, { current: goal.current + parseFloat(amount) });
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add to {goal.name}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount to Add (₹)</label>
            <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" required autoFocus />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Current: {formatINR(goal.current)} → New: {formatINR(goal.current + (parseFloat(amount) || 0))}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Add Savings</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Goals() {
  const { goals, deleteGoal, loading } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.current, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>Total Saved: <strong style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{formatINR(totalSaved)}</strong></span>
            <span>Total Target: <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{formatINR(totalTarget)}</strong></span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditGoal(null); setShowModal(true); }}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ padding: 60 }}>
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>🎯</div>
            <div className="empty-text">No savings goals yet</div>
            <div className="empty-subtext">Create your first savings goal to track your progress.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
              <Plus size={15} /> Create Goal
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {goals.map(goal => {
            const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            const remaining = goal.target - goal.current;
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const completed = pct >= 100;

            return (
              <div key={goal._id} className="card" style={{ padding: 24, borderColor: completed ? 'rgba(52,211,153,0.3)' : 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                {completed && (
                  <div style={{ position: 'absolute', top: 12, right: 48, background: 'var(--green-dim)', color: 'var(--green)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                    ✓ COMPLETE
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', align: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${goal.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={20} color={goal.color} />
                    </div>
                    <div style={{ marginLeft: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{goal.name}</div>
                      {goal.deadline && (
                        <div style={{ fontSize: 12, color: daysLeft && daysLeft < 30 ? 'var(--amber)' : 'var(--text-muted)', marginTop: 2 }}>
                          {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed') : formatDate(goal.deadline)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditGoal(goal); setShowModal(true); }}><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteGoal(goal._id)}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: goal.color }}>{pct}%</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatINR(goal.current)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>of {formatINR(goal.target)}</div>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 10 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}, ${goal.color}aa)` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {completed ? '🎉 Goal achieved!' : `${formatINR(remaining)} to go`}
                  </div>
                  {!completed && (
                    <button className="btn btn-sm" style={{ background: `${goal.color}20`, color: goal.color, border: `1px solid ${goal.color}40`, fontSize: 12, fontWeight: 600 }}
                      onClick={() => setContributeGoal(goal)}>
                      <TrendingUp size={12} /> Add Savings
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <GoalModal goal={editGoal} onClose={() => { setShowModal(false); setEditGoal(null); }} />}
      {contributeGoal && <ContributeModal goal={contributeGoal} onClose={() => setContributeGoal(null)} />}
    </div>
  );
}
