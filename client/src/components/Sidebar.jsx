import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  LayoutDashboard, Receipt, PiggyBank, Target,
  RefreshCw, BarChart3, Download, ShieldAlert
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'budget', label: 'Budget', icon: PiggyBank },
  { id: 'goals', label: 'Savings Goals', icon: Target },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'admin', label: 'Admin', icon: ShieldAlert },
];

export default function Sidebar() {
  const { activePage, setActivePage, exportCSV, analytics } = useApp();

  const overBudgetCount = analytics?.categoryStatus?.filter(c => c.percentUsed > 100).length || 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">💰</div>
          <span className="logo-text">FinFlow</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => setActivePage(id)}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
            {id === 'budget' && overBudgetCount > 0 && (
              <span className="nav-badge">{overBudgetCount}</span>
            )}
          </div>
        ))}
      </nav>

    </aside>
  );
}
