import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { CategoryBadge, formatINR, formatDate } from '../components/CategoryBadge.jsx';
import ExpenseModal from '../components/ExpenseModal.jsx';
import { Plus, Pencil, Trash2, Filter, Download } from 'lucide-react';

export default function Expenses() {
  const { expenses, loading, filterCategory, setFilterCategory, CATEGORIES, deleteExpense, exportCSV } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleEdit = (exp) => { setEditExpense(exp); setShowModal(true); };
  const handleAdd = () => { setEditExpense(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditExpense(null); };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    setConfirmDelete(null);
  };

  const sorted = [...expenses].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === 'amount') { av = parseFloat(av); bv = parseFloat(bv); }
    if (sortKey === 'date') { av = new Date(av); bv = new Date(bv); }
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const totalVisible = sorted.reduce((s, e) => s + e.amount, 0);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {sorted.length} transaction{sorted.length !== 1 ? 's' : ''} · Total: <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatINR(totalVisible)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Download size={14} /> Export CSV</button>
          <button className="btn btn-primary" onClick={handleAdd}><Plus size={16} /> Add Expense</button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <Filter size={14} color="var(--text-muted)" />
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory(cat)}
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Date {sortKey === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Description</th>
                <th>Category</th>
                <th>Tags</th>
                <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}>
                  Amount {sortKey === 'amount' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">🧾</div>
                      <div className="empty-text">No expenses found</div>
                      <div className="empty-subtext">Add your first expense using the button above.</div>
                    </div>
                  </td>
                </tr>
              ) : sorted.map(exp => (
                <tr key={exp._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                    {formatDate(exp.date)}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{exp.description || '—'}</div>
                  </td>
                  <td><CategoryBadge category={exp.category} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(exp.tags || []).map(t => <span key={t} className="chip">{t}</span>)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--red)', fontSize: 15 }}>
                    −{formatINR(exp.amount)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(exp)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setConfirmDelete(exp._id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {showModal && <ExpenseModal expense={editExpense} onClose={handleClose} />}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Expense?</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              This action cannot be undone. The expense will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
