import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, getCatEmoji } from '../components/CategoryBadge.jsx';
import { Plus, Trash2, RefreshCw, Calendar } from 'lucide-react';

function RecurringModal({ onClose }) {
  const { addRecurring, CATEGORIES } = useApp();
  const [form, setForm] = useState({ name: '', amount: '', category: 'Utilities', frequency: 'monthly', nextDue: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await addRecurring({ ...form, amount: parseFloat(form.amount) });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Recurring Expense</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Netflix Subscription" required />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input className="form-input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="199" required />
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select className="form-select" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input className="form-input" type="date" value={form.nextDue} onChange={e => set('nextDue', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Add Recurring</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Recurring() {
  const { recurring, deleteRecurring, loading } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalMonthly = recurring.reduce((s, r) => {
    if (r.frequency === 'weekly') return s + r.amount * 4;
    if (r.frequency === 'monthly') return s + r.amount;
    if (r.frequency === 'quarterly') return s + r.amount / 3;
    if (r.frequency === 'yearly') return s + r.amount / 12;
    return s;
  }, 0);

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const freqLabel = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };
  const freqColor = { weekly: 'var(--accent)', monthly: 'var(--green)', quarterly: 'var(--amber)', yearly: 'var(--pink)' };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Monthly cost: <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{formatINR(totalMonthly)}</strong>
            <span style={{ marginLeft: 8 }}>· {recurring.length} subscriptions</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Recurring</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {['weekly','monthly','quarterly','yearly'].map(freq => {
          const items = recurring.filter(r => r.frequency === freq);
          const total = items.reduce((s, r) => s + r.amount, 0);
          return (
            <div key={freq} className="card" style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{freqLabel[freq]}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: freqColor[freq] }}>{formatINR(total)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>

      {recurring.length === 0 ? (
        <div className="card" style={{ padding: 60 }}>
          <div className="empty-state">
            <RefreshCw size={40} strokeWidth={1.5} color="var(--text-dim)" />
            <div className="empty-text">No recurring expenses</div>
            <div className="empty-subtext">Add subscriptions, bills, and regular payments to track them here.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
              <Plus size={15} /> Add First Recurring
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {recurring.map(r => {
            const daysUntil = getDaysUntil(r.nextDue);
            const isDueSoon = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
            const isOverdue = daysUntil !== null && daysUntil < 0;

            return (
              <div key={r.id} className="card" style={{
                padding: 20,
                borderColor: isOverdue ? 'rgba(248,113,113,0.3)' : isDueSoon ? 'rgba(251,191,36,0.3)' : 'var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {getCatEmoji(r.category)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.category}</div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteRecurring(r.id)}><Trash2 size={13} /></button>
                </div>

                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{formatINR(r.amount)}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <RefreshCw size={11} color={freqColor[r.frequency]} />
                      <span style={{ fontSize: 12, color: freqColor[r.frequency], fontWeight: 600 }}>{freqLabel[r.frequency]}</span>
                    </div>
                  </div>
                  {r.nextDue && (
                    <div style={{
                      textAlign: 'right',
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: isOverdue ? 'var(--red-dim)' : isDueSoon ? 'var(--amber-dim)' : 'var(--bg-elevated)',
                      border: `1px solid ${isOverdue ? 'rgba(248,113,113,0.2)' : isDueSoon ? 'rgba(251,191,36,0.2)' : 'var(--border)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: isOverdue ? 'var(--red)' : isDueSoon ? 'var(--amber)' : 'var(--text-muted)' }}>
                        <Calendar size={11} />
                        {isOverdue ? 'OVERDUE' : isDueSoon ? `Due in ${daysUntil}d` : `Due: ${new Date(r.nextDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <RecurringModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
