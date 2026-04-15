import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Search, Bell, RefreshCw, Calendar, Save, LogOut } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Financial overview at a glance' },
  expenses: { title: 'Expenses', subtitle: 'Track and manage your spending' },
  budget: { title: 'Budget Manager', subtitle: 'Set and monitor spending limits' },
  goals: { title: 'Savings Goals', subtitle: 'Track your financial milestones' },
  recurring: { title: 'Recurring Expenses', subtitle: 'Manage subscriptions & bills' },
  analytics: { title: 'Analytics', subtitle: 'Deep dive into spending patterns' },
  admin: { title: 'Admin Dashboard', subtitle: 'System overview & control panel' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Topbar() {
  const { activePage, search, setSearch, filterMonth, setFilterMonth, filterYear, setFilterYear, refetch, budgets } = useApp();
  const info = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;
  const [saving, setSaving] = useState(false);

  // Get logged in user name
  const savedUser = localStorage.getItem('user');
  const userName = savedUser ? JSON.parse(savedUser).name : 'User';

  // Save Budget to MongoDB
  const handleSaveBudget = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/budgets', budgets, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Budget saved to database! ✅');
    } catch (err) {
      toast.error('Failed to save budget ❌');
    }
    setSaving(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="topbar">
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          {info.title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{info.subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Month/Year Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <Calendar size={14} color="var(--text-muted)" />
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(parseInt(e.target.value))}
            style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={filterYear}
            onChange={e => setFilterYear(parseInt(e.target.value))}
            style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={15} color="var(--text-dim)" />
          <input
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Refresh */}
        <button className="btn btn-ghost btn-icon" onClick={refetch} title="Refresh">
          <RefreshCw size={16} />
        </button>

        {/* ── SAVE BUDGET BUTTON ── */}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSaveBudget}
          disabled={saving}
          title="Save current budget to database"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Budget'}
        </button>

        {/* User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--pink))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{userName}</span>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
