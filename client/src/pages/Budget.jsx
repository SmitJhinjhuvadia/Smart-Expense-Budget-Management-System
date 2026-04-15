import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR, getCatEmoji } from '../components/CategoryBadge.jsx';
import { Save, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Budget() {
  const { budgets, analytics, updateBudgets, CATEGORIES, loading } = useApp();
  const [monthly, setMonthly] = useState('');
  const [cats, setCats] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (budgets) {
      setMonthly(budgets.monthly || '');
      setCats({ ...budgets.categories });
    }
  }, [budgets]);

  const handleSave = async () => {
    setSaving(true);
    const catsBudget = {};
    CATEGORIES.forEach(c => { catsBudget[c] = parseFloat(cats[c]) || 0; });
    await updateBudgets({ monthly: parseFloat(monthly), categories: catsBudget });
    setSaving(false);
  };

  const totalCatBudget = CATEGORIES.reduce((s, c) => s + (parseFloat(cats[c]) || 0), 0);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      {/* Monthly Budget */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Monthly Budget</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Set your total spending limit for the month</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'center' }}>
          <div>
            <label className="form-label">Total Monthly Budget (₹)</label>
            <input
              className="form-input"
              type="number"
              value={monthly}
              onChange={e => setMonthly(e.target.value)}
              placeholder="e.g. 50000"
              style={{ fontSize: 20, fontFamily: 'var(--font-mono)', padding: '14px 16px' }}
            />
          </div>
          <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
            {analytics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Spent</div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)' }}>{formatINR(analytics.totalExpenses)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Remaining</div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, color: analytics.remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {formatINR(Math.abs(analytics.remaining))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Used</div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{analytics.percentUsed}%</div>
                </div>
              </div>
            )}
            <div className="progress-bar" style={{ marginTop: 16, height: 10 }}>
              <div className="progress-fill" style={{
                width: `${Math.min(analytics?.percentUsed || 0, 100)}%`,
                background: (analytics?.percentUsed || 0) > 90 ? 'var(--red)' : (analytics?.percentUsed || 0) > 70 ? 'var(--amber)' : 'linear-gradient(90deg, var(--accent), var(--pink))'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Category Budgets</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Total allocated: <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{formatINR(totalCatBudget)}</strong>
            {parseFloat(monthly) > 0 && totalCatBudget !== parseFloat(monthly) && (
              <span style={{ color: 'var(--amber)', marginLeft: 8 }}>
                (differs from monthly budget by {formatINR(Math.abs(parseFloat(monthly) - totalCatBudget))})
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {CATEGORIES.map(cat => {
            const catData = analytics?.categoryStatus?.find(c => c.category === cat);
            const spent = catData?.spent || 0;
            const pct = cats[cat] ? Math.round((spent / parseFloat(cats[cat])) * 100) : 0;
            const isOver = pct > 100;
            const isNear = pct > 80 && !isOver;

            return (
              <div key={cat} style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 18, border: `1px solid ${isOver ? 'rgba(248,113,113,0.25)' : isNear ? 'rgba(251,191,36,0.2)' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{getCatEmoji(cat)}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{cat}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isOver && <AlertTriangle size={14} color="var(--red)" />}
                    {isNear && <TrendingUp size={14} color="var(--amber)" />}
                    {pct > 0 && pct <= 80 && <CheckCircle2 size={14} color="var(--green)" />}
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--text-muted)' }}>
                      {pct}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 50, flexShrink: 0 }}>Budget</span>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>₹</span>
                    <input
                      className="form-input"
                      type="number"
                      value={cats[cat] || ''}
                      onChange={e => setCats(prev => ({ ...prev, [cat]: e.target.value }))}
                      placeholder="0"
                      style={{ paddingLeft: 28, fontFamily: 'var(--font-mono)', fontSize: 14 }}
                    />
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: isOver ? 'var(--red)' : isNear ? 'var(--amber)' : 'var(--green)'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Spent: {formatINR(spent)}</span>
                  <span>Left: {formatINR(Math.max((parseFloat(cats[cat]) || 0) - spent, 0))}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save All Budgets'}
          </button>
        </div>
      </div>
    </div>
  );
}
